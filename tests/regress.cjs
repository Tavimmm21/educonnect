// Suíte de regressão ponta a ponta (Playwright) do Lume.
// Uso: com o app rodando (npm run dev), em outro terminal:
//   npm i -D playwright && npx playwright install chromium
//   node tests/regress.cjs            (ou BASE_URL=http://localhost:5174 node tests/regress.cjs)
// Código de saída 1 se algum caso falhar.
const { chromium } = require('playwright');
const results = [];
const rec = (id, ok, info = '') => { results.push({ id, ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${info}`); };

(async () => {
  const b = await chromium.launch();
  const URL = process.env.BASE_URL || 'http://localhost:5173';
  const errs = [];
  const open = async (w, h) => {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('console', (m) => { if (['warning', 'error'].includes(m.type())) errs.push(m.text().slice(0, 100)); });
    p.on('pageerror', (e) => errs.push('ERR ' + e.message));
    await p.goto(URL); await p.waitForTimeout(700); return p;
  };
  const nav = async (p, w, pg) => {
    if (w < 1200) { await p.click('[aria-label="Abrir menu de navegação"]'); await p.waitForTimeout(250); await p.click(`.MuiDrawer-root:not(.MuiDrawer-docked) >> text=${pg}`); }
    else await p.click(`.MuiDrawer-docked >> text=${pg}`);
    await p.waitForTimeout(400);
  };
  const toastText = (p) => p.textContent('.MuiSnackbar-root .MuiAlert-message');
  const btn = (p) => p.locator('button:has-text("Continuar matrícula"), button:has(.MuiCircularProgress-root)').last();

  // CT-01 responsividade (36 verificações) + CT-02 console limpo
  const pages = ['Dashboard', 'Notas', 'Disciplinas', 'Matrícula', 'Calendário', 'Meu perfil'];
  let bad = [];
  for (const [w, h] of [[360, 800], [768, 1024], [1366, 768]]) {
    const p = await open(w, h);
    for (const pg of pages) {
      await nav(p, w, pg);
      for (const mode of ['claro', 'escuro']) {
        if (mode === 'escuro') await p.click('[aria-label="Ativar modo escuro"]');
        await p.waitForTimeout(100);
        const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (o !== 0) bad.push(`${w}/${pg}/${mode}:${o}`);
        if (mode === 'escuro') await p.click('[aria-label="Ativar modo claro"]');
      }
    }
    await p.close();
  }
  rec('CT-01 Responsividade 6 telas x 3 larguras x 2 modos', bad.length === 0, bad.length ? bad.join(',') : '36/36 sem rolagem horizontal');

  // desktop 1366
  let p = await open(1366, 768);

  // CT-03 modo escuro
  const bgOf = () => p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const b0 = await bgOf();
  await p.click('[aria-label="Ativar modo escuro"]'); await p.waitForTimeout(200);
  const b1 = await bgOf();
  await p.click('[aria-label="Ativar modo claro"]'); await p.waitForTimeout(200);
  const b2 = await bgOf();
  rec('CT-03 Modo escuro alterna e inicia claro', b0 === 'rgb(245, 245, 245)' && b1 === 'rgb(10, 10, 10)' && b2 === b0, `${b0} -> ${b1} -> ${b2}`);

  // CT-04 teclado: skip link, Tab e barra de espaço
  const fresh = await open(1366, 768);
  const skipTop = await fresh.evaluate(() => Math.round(document.querySelector('a[href="#conteudo"]').getBoundingClientRect().top));
  await fresh.keyboard.press('Tab');
  const first = await fresh.evaluate(() => [document.activeElement.textContent.trim(), Math.round(document.activeElement.getBoundingClientRect().top)]);
  await fresh.keyboard.press('Enter');
  const focusedMain = await fresh.evaluate(() => document.activeElement.id);
  await fresh.close();
  rec('CT-04 Skip link oculto e visível ao dar Tab', skipTop < 0 && first[0] === 'Pular para o conteúdo' && first[1] >= 0 && focusedMain === 'conteudo', `${skipTop} -> ${first}`);
  await nav(p, 1366, 'Matrícula');
  await p.focus('[aria-label="Selecionar Computação em Nuvem"]'); await p.keyboard.press('Space');
  const sel1 = await p.locator('input[type=checkbox]:checked').count();
  await p.keyboard.press('Space');
  const sel0 = await p.locator('input[type=checkbox]:checked').count();
  rec('CT-05 Seleção de disciplina pela barra de espaço', sel1 === 1 && sel0 === 0, `${sel1} / ${sel0}`);
  const unlabeled = await p.evaluate(() => [...document.querySelectorAll('button,input,[role=button]')].filter((e) => !(e.getAttribute('aria-label') || e.textContent.trim() || (e.labels && e.labels.length) || e.getAttribute('aria-labelledby'))).length);
  rec('CT-06 Controles da Matrícula com nome acessível', unlabeled === 0, `${unlabeled} sem nome`);

  // CT-07 matrícula vazia -> erro (Desafio B)
  await btn(p).click(); await p.waitForTimeout(300);
  const em = await toastText(p);
  const isErr = await p.locator('.MuiSnackbar-root .MuiAlert-colorError.MuiAlert-filled').count();
  rec('CT-07 Matrícula sem seleção exibe erro (Desafio B)', em === 'Erro: Selecione pelo menos uma disciplina para continuar a matrícula.' && isErr === 1, em);
  await p.waitForTimeout(4300);

  // CT-08 loading + sucesso
  await p.click('[aria-label="Selecionar Computação em Nuvem"]');
  await btn(p).click(); await p.waitForTimeout(300);
  const dis = await p.locator('button:has(.MuiCircularProgress-root)').isDisabled();
  await p.waitForTimeout(2300);
  const st = await toastText(p);
  rec('CT-08 Loading (botão desabilitado) e sucesso após 2 s', dis && /Pré-matrícula realizada com sucesso para 1/.test(st), st);
  await p.waitForTimeout(4300);

  // CT-09 conflito de horário
  await p.click('[aria-label="Selecionar Redes de Computadores"]');
  const a1 = (await p.locator('.MuiAlert-message').allTextContents()).join('|');
  const dis1 = await btn(p).isDisabled();
  await p.click('[aria-label="Selecionar Segurança da Informação"]');
  const n2 = await p.locator('.MuiAlert-message').count();
  rec('CT-09 Conflito com disciplina cursada e entre escolhidas', /Banco de Dados, que você já cursa/.test(a1) && dis1 && n2 === 2, `${n2} alertas`);
  await p.click('[aria-label="Selecionar Redes de Computadores"]'); await p.click('[aria-label="Selecionar Segurança da Informação"]');

  // CT-10 limite de créditos
  await p.click('[aria-label="Selecionar Computação em Nuvem"]'); await p.click('[aria-label="Selecionar Mobile Development"]');
  const ok32 = !(await btn(p).isDisabled());
  await p.click('[aria-label="Selecionar Inteligência Artificial"]');
  const over = (await p.locator('.MuiAlert-message').allTextContents()).join('|');
  const dis37 = await btn(p).isDisabled();
  rec('CT-10 Limite de 32 créditos (32 libera, 37 bloqueia)', ok32 && dis37 && /Limite excedido/.test(over), over.slice(0, 60));
  await p.click('[aria-label="Selecionar Inteligência Artificial"]'); await p.click('[aria-label="Selecionar Computação em Nuvem"]'); await p.click('[aria-label="Selecionar Mobile Development"]');

  // CT-11 assistente de grade
  await p.click('text=Montar grade para mim'); await p.waitForTimeout(500);
  const plans = await p.locator('[role=dialog] button:has-text("Aplicar esta grade")').count();
  await p.locator('[role=dialog] button:has-text("Aplicar esta grade")').first().click(); await p.waitForTimeout(400);
  const applied = await p.locator('input[type=checkbox]:checked').count();
  rec('CT-11 Assistente de grade sugere e aplica', plans >= 1 && applied >= 1, `${plans} sugestões, ${applied} marcadas`);
  await p.waitForTimeout(4300);

  // CT-12 notificações
  await p.click('[aria-label="Ver notificações"]'); await p.waitForTimeout(300);
  const notif = await p.locator('text=Notificações').count();
  await p.keyboard.press('Escape');
  rec('CT-12 Sino de notificações abre menu', notif >= 1, `${notif}`);

  // CT-13 perfil
  await nav(p, 1366, 'Meu perfil');
  await p.fill('input[type=email]', 'errado'); await p.fill('input[type=tel]', '12');
  await p.click('text=Salvar alterações'); await p.waitForTimeout(300);
  const perr = await toastText(p);
  const helpers = await p.locator('.Mui-error').count();
  await p.waitForTimeout(4300);
  await p.fill('input[type=email]', 'joao@email.com'); await p.fill('input[type=tel]', '(11) 98888-7777');
  await p.click('text=Salvar alterações'); await p.waitForTimeout(300);
  const pdis = await p.locator('button:has(.MuiCircularProgress-root)').isDisabled();
  await p.waitForTimeout(1800);
  const pok = await toastText(p);
  rec('CT-13 Perfil: validação, loading e "Alterações salvas com sucesso!"', /Corrija os campos/.test(perr) && helpers > 0 && pdis && pok === 'Alterações salvas com sucesso!', pok);

  // CT-14 notas: busca, filtro e estado vazio
  await nav(p, 1366, 'Notas');
  const total = await p.locator('main ul li').count();
  await p.click('text=Em andamento (2)');
  const f = await p.locator('main ul li').count();
  await p.fill('input[aria-label="Buscar disciplina no boletim"]', 'zzz');
  const empty = await p.isVisible('text=Nenhuma disciplina encontrada');
  await p.click('text=Limpar filtros');
  const back = await p.locator('main ul li').count();
  rec('CT-14 Boletim: filtro (6->2), estado vazio e limpar', total === 6 && f === 2 && empty && back === 6, `${total}->${f}->${back}`);

  // CT-15 a CT-17 calendário
  await nav(p, 1366, 'Calendário');
  await p.click('[aria-label^="sexta-feira, 23 de abril"]');
  await p.click('[aria-label="Simular falta em Estruturas de Dados"]'); await p.waitForTimeout(300);
  const d1 = (await p.locator('[role=dialog] .MuiAlert-message').allTextContents()).join('|');
  await p.click('text=Cancelar'); await p.waitForTimeout(300);
  const noSim = await p.locator('text=Simulações (').count();
  await p.click('[role=tab]:has-text("jun")');
  await p.click('[aria-label^="segunda-feira, 7 de junho"]');
  await p.click('[aria-label="Simular falta em Desenvolvimento Web"]'); await p.waitForTimeout(300);
  const d2 = (await p.locator('[role=dialog] .MuiAlert-message').allTextContents()).join('|');
  await p.click('text=Cancelar'); await p.waitForTimeout(300);
  rec('CT-15 Alerta de segurança: entrega e prova (cancelar não simula)', /Entrega neste dia/.test(d1) && /Prova P2/.test(d2) && noSim === 0, `${d1.slice(0, 40)} / ${d2.slice(0, 30)}`);

  await p.click('[role=tab]:has-text("mai")');
  await p.click('[aria-label^="quarta-feira, 5 de maio"]'); await p.click('[aria-label="Simular falta em Engenharia de Software"]'); await p.waitForTimeout(300);
  const u1 = (await p.locator('[role=dialog] .MuiAlert-message').allTextContents()).join('|');
  await p.click('text=Simular mesmo assim'); await p.waitForTimeout(300);
  await p.click('[aria-label^="quarta-feira, 12 de maio"]'); await p.click('[aria-label="Simular falta em Engenharia de Software"]'); await p.waitForTimeout(300);
  const u2 = (await p.locator('[role=dialog] .MuiAlert-message').allTextContents()).join('|');
  await p.click('text=Simular mesmo assim'); await p.waitForTimeout(300);
  const crit = await p.locator('text=Acima do limite').count();
  rec('CT-16 Última falta permitida e limite de faltas excedido', /última falta permitida/.test(u1) && /Passa do limite de 4 faltas/.test(u2) && crit >= 1, `${u1.slice(0, 40)} / ${u2.slice(0, 40)}`);
  await p.click('text=Limpar'); await p.waitForTimeout(300);
  const cleared = await p.locator('text=Simulações (').count();
  rec('CT-17 Limpar simulações', cleared === 0, `${cleared}`);

  // CT-18 assistente
  const ask = async (q) => { await p.fill('input[aria-label="Pergunte ao assistente"]', q); await p.keyboard.press('Enter'); await p.waitForTimeout(250); return p.locator('[role=log]').innerText(); };
  let log = await ask('Quantas vezes posso faltar?');
  const c1 = /pode faltar 1 vez/.test(log);
  log = await ask('Posso faltar em 23/04?'); const c2 = /com ressalvas/.test(log);
  log = await ask('Posso faltar em 21/04?'); const c3 = /feriado \(Tiradentes\)/.test(log);
  log = await ask('Posso faltar em 31/02?'); const c4 = /não é uma data válida/.test(log);
  log = await ask('Posso faltar em 10/07?'); const c5 = /fora do semestre/.test(log);
  log = await ask('Quando são as provas?'); const c6 = /Prova Integrativa/.test(log) && /Prova P1 — Banco de Dados: ter, 13\/04/.test(log);
  log = await ask('Quais os melhores dias para faltar?'); const c7 = /ter, 20\/04/.test(log);
  rec('CT-18 Assistente de faltas (7 perguntas)', c1 && c2 && c3 && c4 && c5 && c6 && c7, [c1, c2, c3, c4, c5, c6, c7].join(','));
  await p.close();

  rec('CT-02 Console sem erros nem avisos em toda a suíte', errs.length === 0, errs.length ? errs.slice(0, 3).join(' | ') : '0 mensagens');

  const pass = results.filter((r) => r.ok).length;
  console.log(`\nRESUMO: ${pass}/${results.length} aprovados`);
  await b.close();
  process.exit(pass === results.length ? 0 : 1);
})();
