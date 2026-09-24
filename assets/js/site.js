// Connect Alpha — interações do site (sem dependências)
(function () {
  var raiz = document.documentElement;
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WHATS = '5535998872633';
  var esperar = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- topo, barra de progresso e linha do "Como funciona" ---------- */
  var topo = document.querySelector('.topo');
  var passos = document.querySelector('.passos');
  var itensPassos = passos ? passos.querySelectorAll('.passo') : [];
  var quadro = false;
  var aoRolarExtra = [];

  function aoRolar() {
    quadro = false;
    var y = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    if (topo) {
      topo.classList.toggle('rolou', y > 12);
      topo.style.setProperty('--p', total > 0 ? Math.min(1, y / total) : 0);
    }
    if (passos) {
      var r = passos.getBoundingClientRect();
      var inicio = window.innerHeight * 0.8;
      var p = window.innerWidth >= 900
        ? (inicio - r.top) / (window.innerHeight * 0.5)
        : (inicio - r.top) / (r.height + window.innerHeight * 0.2);
      p = Math.max(0, Math.min(1, p));
      passos.style.setProperty('--lp', p.toFixed(3));
      itensPassos.forEach(function (el, i) {
        el.classList.toggle('on', p >= i / Math.max(1, itensPassos.length - 1) - 0.001);
      });
    }
    aoRolarExtra.forEach(function (f) { f(); });
  }
  window.addEventListener('scroll', function () {
    if (!quadro) { quadro = true; requestAnimationFrame(aoRolar); }
  }, { passive: true });
  window.addEventListener('resize', aoRolar);

  /* ---------- menu do celular ---------- */
  var botaoMenu = document.querySelector('.menu-botao');
  var menuMovel = document.getElementById('menu-movel');
  function abrirMenu(abrir) {
    if (!botaoMenu || !menuMovel) return;
    botaoMenu.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    botaoMenu.querySelector('.sr-only').textContent = abrir ? 'Fechar menu' : 'Abrir menu';
    menuMovel.hidden = !abrir;
    document.body.classList.toggle('menu-aberto', abrir);
    if (abrir) { var l = menuMovel.querySelector('a'); if (l) l.focus(); }
  }
  if (botaoMenu && menuMovel) {
    botaoMenu.addEventListener('click', function () { abrirMenu(menuMovel.hidden); });
    menuMovel.addEventListener('click', function (e) { if (e.target.closest('a')) abrirMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menuMovel.hidden) { abrirMenu(false); botaoMenu.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1000 && !menuMovel.hidden) abrirMenu(false); });
  }

  /* ---------- entrada suave dos blocos ---------- */
  var revela = document.querySelectorAll('.revela');
  if ('IntersectionObserver' in window && !menosMovimento) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revela.forEach(function (el) { io.observe(el); });
  } else {
    revela.forEach(function (el) { el.classList.add('visivel'); });
  }

  /* ---------- brilho que acompanha o mouse nos cartões ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- demonstração da abertura ---------- */
  var demo = document.querySelector('.demo');
  if (demo) iniciarDemo(demo);

  function iniciarDemo(demo) {
    var palco = demo.querySelector('.palco');
    var texto = demo.querySelector('.busca-texto');
    var r1 = demo.querySelector('.r1');
    var r2 = demo.querySelector('.r2');
    var cursor = demo.querySelector('.cursor');
    var etapas = demo.querySelectorAll('.demo-etapas li');
    var BUSCA = 'contador perto de mim';
    var visivel = true;

    function marcarEtapa(n) {
      etapas.forEach(function (li, i) {
        li.classList.toggle('ativa', i + 1 === n);
        li.classList.toggle('feita', i + 1 < n);
      });
    }
    function posicionar(alvo, semTransicao) {
      var p = palco.getBoundingClientRect();
      var x, y;
      if (alvo) {
        var a = alvo.getBoundingClientRect();
        x = a.left - p.left + a.width * 0.55; y = a.top - p.top + a.height * 0.55;
      } else { x = p.width * 0.62; y = p.height * 0.98; }
      if (semTransicao) cursor.style.transition = 'none';
      cursor.style.setProperty('--cx', (x - 5) + 'px');
      cursor.style.setProperty('--cy', (y - 3) + 'px');
      if (semTransicao) { void cursor.offsetWidth; cursor.style.transition = ''; }
    }
    function estadoFinal() {
      texto.textContent = BUSCA;
      demo.classList.add('resultados', 'msg');
      r1.classList.add('erro');
      demo.dataset.etapa = '3';
      marcarEtapa(3);
    }
    if (menosMovimento) { estadoFinal(); return; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; }).observe(demo);
    }
    async function pronto() { while (!visivel || document.hidden) await esperar(400); }

    async function ciclo() {
      // volta ao começo
      demo.classList.add('seta-sai');
      await esperar(500);
      demo.classList.remove('resultados', 'com-cursor', 'msg');
      r1.classList.remove('clicou', 'erro');
      r2.classList.remove('ganha');
      demo.dataset.etapa = '0';
      texto.textContent = '';
      posicionar(null, true);
      await esperar(700);
      demo.classList.remove('seta-sai');
      await pronto();

      // 1. o cliente procura
      marcarEtapa(1); demo.dataset.etapa = '1';
      for (var i = 1; i <= BUSCA.length; i++) { texto.textContent = BUSCA.slice(0, i); await esperar(65); }
      await esperar(350);
      demo.classList.add('resultados');
      await esperar(1000);

      // 2. clica em "Site" e dá erro; depois vai para o concorrente
      demo.classList.add('com-cursor');
      posicionar(r1.querySelector('.r-site'));
      await esperar(950);
      marcarEtapa(2); demo.dataset.etapa = '2';
      cursor.classList.add('aperta'); r1.classList.add('clicou');
      await esperar(260);
      cursor.classList.remove('aperta'); r1.classList.remove('clicou'); r1.classList.add('erro');
      await esperar(1700);
      posicionar(r2.querySelector('.r-site'));
      await esperar(950);
      cursor.classList.add('aperta'); r2.classList.add('ganha');
      await esperar(260);
      cursor.classList.remove('aperta');
      await esperar(1100);

      // 3. com a Connect Alpha
      demo.classList.remove('com-cursor');
      marcarEtapa(3); demo.dataset.etapa = '3';
      await esperar(1500);
      demo.classList.add('msg');
      await esperar(5600);
      await pronto();
    }
    (async function () {
      posicionar(null, true);
      await esperar(600);
      for (;;) { await ciclo(); }
    })();
  }

  /* ---------- diagnóstico ---------- */
  var quiz = document.querySelector('[data-quiz]');
  if (quiz) iniciarQuiz(quiz);

  function iniciarQuiz(quiz) {
    var P = [
      { t: 'Quando alguém procura a sua empresa no Google, aparece um site próprio?', a: 'Site próprio, não só o Instagram ou um Linktree.',
        f: 'Sem site próprio', e: 'Quem pesquisa no Google só encontra o Instagram, ou nada. É o ponto que mais faz cliente desistir.', m: 'não tenho site próprio' },
      { t: 'O site tem endereço próprio, do tipo suaempresa.com.br?', a: 'E não um endereço gratuito, como "suaempresa.wixsite.com".',
        f: 'Sem endereço próprio', e: 'Endereço próprio passa mais confiança do que link de Instagram, Linktree ou site gratuito.', m: 'sem endereço próprio' },
      { t: 'O site abre bem e rápido no celular?', a: 'Sem precisar dar zoom nem esperar carregar.',
        f: 'Site ruim no celular', e: 'A maioria das pessoas pesquisa pelo celular. Se o site não abre bem ali, o cliente vai embora na hora.', m: 'site ruim no celular' },
      { t: 'O site abre sem o aviso "Não seguro" ao lado do endereço?', a: 'Se o navegador mostrar "Não seguro" ou der erro, a resposta é não.',
        f: 'Site marcado como "Não seguro"', e: 'Quando o navegador avisa que o site "não é seguro", e muita gente desiste antes de ler.', m: 'site aparece como não seguro' },
      { t: 'Dá para chamar no WhatsApp ou agendar com um toque?', a: 'Direto do Google ou do site, sem procurar o número.',
        f: 'Contato difícil', e: 'Se falar com você exige vários cliques, o cliente chama quem estiver mais fácil.', m: 'contato difícil' },
      { t: 'O visual do site parece atual?', a: 'Se ele parece ter parado no tempo, a resposta é não.',
        f: 'Visual desatualizado', e: 'Um visual antigo faz o cliente achar que o negócio também parou no tempo.', m: 'visual desatualizado' },
      { t: 'Horário, endereço e serviços estão atualizados na internet?', a: 'No Google, no site e nas redes sociais.',
        f: 'Informações desatualizadas', e: 'Horário ou endereço errado faz o cliente perder a viagem e não voltar.', m: 'informações desatualizadas' }
    ];
    var DEPENDEM_DO_SITE = [1, 2, 3, 5];
    var el = function (s) { return quiz.querySelector(s); };
    var telaP = el('[data-tela="pergunta"]'), telaR = el('[data-tela="resultado"]');
    var resp = [], historico = [], atual = 0;

    function mostrarPergunta(i, animar) {
      atual = i;
      var respondidas = historico.length;
      el('[data-contador]').textContent = 'Pergunta ' + (respondidas + 1) + ' de ' + (resp[0] && resp[0] !== 'sim' ? 3 : 7);
      el('[data-barra]').style.width = (i / P.length * 100) + '%';
      el('[data-texto]').textContent = P[i].t;
      el('[data-ajuda]').textContent = P[i].a;
      el('[data-voltar]').hidden = historico.length === 0;
      if (animar) { telaP.classList.remove('troca'); void telaP.offsetWidth; telaP.classList.add('troca'); el('[data-texto]').focus({ preventScroll: true }); }
    }
    function proxima(i) {
      if (i === 0 && resp[0] !== 'sim') {
        DEPENDEM_DO_SITE.forEach(function (k) { resp[k] = 'sem-site'; });
        return 4;
      }
      for (var k = i + 1; k < P.length; k++) if (resp[k] !== 'sem-site') return k;
      return -1;
    }
    quiz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-resp]');
      if (b) {
        resp[atual] = b.dataset.resp;
        if (atual === 0 && resp[0] === 'sim') DEPENDEM_DO_SITE.forEach(function (k) { if (resp[k] === 'sem-site') resp[k] = undefined; });
        historico.push(atual);
        var n = proxima(atual);
        if (n === -1) mostrarResultado(); else mostrarPergunta(n, true);
        return;
      }
      if (e.target.closest('[data-voltar]') && historico.length) {
        mostrarPergunta(historico.pop(), true);
        return;
      }
      if (e.target.closest('[data-refazer]')) {
        resp = []; historico = [];
        telaR.hidden = true; telaP.hidden = false;
        mostrarPergunta(0, true);
      }
    });

    function mostrarResultado() {
      var pontos = resp.filter(function (r) { return r === 'sim'; }).length;
      var semSite = resp[0] !== 'sim';
      var falhas = P.map(function (p, i) { return { p: p, r: resp[i] }; })
        .filter(function (x) { return x.r !== 'sim' && x.r !== 'sem-site'; });
      var titulo, sub;
      if (pontos === 7) {
        titulo = 'A sua presença na internet está em dia.';
        sub = 'O próximo passo é trazer mais gente até ela: anúncios no Google e no Instagram e atendimento automático no WhatsApp.';
      } else if (pontos >= 4) {
        titulo = 'Você está perdendo clientes em alguns pontos.';
        sub = 'Você está no caminho certo, mas cada item abaixo ainda faz alguém desistir antes de falar com você:';
      } else {
        titulo = semSite ? 'Quem procura a sua empresa não encontra um site.' : 'Quem te encontra tem motivos para desistir.';
        sub = 'Hoje, quem te procura na internet tem motivos para desistir. Estes são os pontos:';
      }
      el('[data-pontos]').textContent = pontos;
      el('[data-titulo]').textContent = titulo;
      el('[data-sub]').textContent = sub;
      var ul = el('[data-falhas]');
      ul.innerHTML = '';
      falhas.forEach(function (x) {
        var li = document.createElement('li');
        var b = document.createElement('b'); b.textContent = x.p.f + (x.r === 'nao-sei' ? ' (você não soube dizer)' : '');
        li.appendChild(b); li.appendChild(document.createTextNode(x.p.e));
        ul.appendChild(li);
      });
      ul.hidden = falhas.length === 0;
      el('[data-barra]').style.width = '100%';
      telaP.hidden = true; telaR.hidden = false;
      var arco = el('[data-arco]');
      arco.style.strokeDasharray = '0 100';
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        arco.style.strokeDasharray = (pontos / 7 * 100) + ' 100';
      }); });
      atualizarLink(pontos, falhas);
      el('[data-empresa]').oninput = function () { atualizarLink(pontos, falhas); };
      el('[data-titulo]').focus({ preventScroll: true });
    }
    function atualizarLink(pontos, falhas) {
      var empresa = el('[data-empresa]').value.trim();
      var msg = 'Olá, Matheus! Fiz o diagnóstico no site da Connect Alpha' + (empresa ? ' (empresa: ' + empresa + ')' : '') +
        '. Resultado: ' + pontos + ' de 7 em dia.';
      if (falhas.length) msg += ' Pontos a melhorar: ' + falhas.map(function (x) { return x.p.m; }).join('; ') + '.';
      msg += pontos === 7 ? ' Quero saber mais sobre anúncios e automação.' : ' Quero ver como ficaria o meu site.';
      el('[data-enviar]').href = 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg);
    }
    mostrarPergunta(0, false);
  }

  /* ---------- trilha de luz: da abertura até o botão final (computador) ---------- */
  var fim = document.querySelector('.trilha-fim');
  var telaGrande = window.matchMedia('(min-width: 1100px)');
  var trilha = null;

  // posição na página ignorando transform (as animações de entrada deslocam os elementos)
  function posicao(el) {
    var x = 0, y = 0, e = el;
    while (e) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
  }

  function montarTrilha() {
    if (trilha) { trilha.svg.remove(); trilha = null; }
    raiz.classList.remove('com-trilha');
    document.querySelectorAll('.trilha-ponto.aceso, .trilha-fim.aceso').forEach(function (e) { e.classList.remove('aceso'); });
    var final = document.querySelector('.final');
    if (final) final.classList.remove('chegou');
    if (!fim || !telaGrande.matches || menosMovimento) return;

    var ref = document.querySelector('.hero-texto');
    var esquerda = posicao(ref).x;
    var G = Math.max(10, esquerda - 22);
    var pontos = Array.prototype.slice.call(document.querySelectorAll('.trilha-ponto')).map(function (k) {
      var r = posicao(k);
      return { el: k, x: r.x + 3.5, y: r.y + r.h / 2 };
    }).filter(function (p) { return Math.abs(p.x - esquerda) < 40; });
    if (!pontos.length) return;
    var rf = posicao(fim);
    var fx = rf.x + rf.w / 2, fy = rf.y - 8;
    var yCurva = fy - 70, r = 28;
    var y0 = pontos[0].y;

    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'trilha');
    svg.setAttribute('aria-hidden', 'true');
    var alturaDoc = document.documentElement.scrollHeight;
    svg.setAttribute('width', document.documentElement.clientWidth);
    svg.setAttribute('height', alturaDoc);
    svg.style.height = alturaDoc + 'px';
    function caminho(d, cls) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); svg.appendChild(p); return p; }

    var dTronco = 'M' + G + ' ' + y0 + ' V' + (yCurva - r);
    var dFinal = 'M' + G + ' ' + (yCurva - r) + ' Q' + G + ' ' + yCurva + ' ' + (G + r) + ' ' + yCurva +
      ' H' + (fx - r) + ' Q' + fx + ' ' + yCurva + ' ' + fx + ' ' + (yCurva + r) + ' V' + fy;
    caminho(dTronco, 'base'); caminho(dFinal, 'base');
    var ramos = pontos.map(function (p) {
      caminho('M' + G + ' ' + p.y + ' H' + (p.x - 6), 'base');
      var luz = caminho('M' + G + ' ' + p.y + ' H' + (p.x - 6), 'luz');
      var L = luz.getTotalLength(); luz.style.strokeDasharray = L; luz.style.strokeDashoffset = L;
      luz.style.transition = 'stroke-dashoffset .35s ease';
      return { p: p, luz: luz, L: L };
    });
    var tronco = caminho(dTronco, 'luz');
    var LT = tronco.getTotalLength();
    tronco.style.strokeDasharray = LT;
    var ultimo = caminho(dFinal, 'luz');
    var LF = ultimo.getTotalLength();
    ultimo.style.strokeDasharray = LF; ultimo.style.strokeDashoffset = LF;
    ultimo.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.5, 0, .2, 1)';
    var cabeca = document.createElementNS(NS, 'circle');
    cabeca.setAttribute('r', 4); cabeca.setAttribute('class', 'cabeca'); cabeca.setAttribute('cx', G);
    svg.appendChild(cabeca);
    document.body.appendChild(svg);
    raiz.classList.add('com-trilha');
    var chegou = false, temporizador = null;

    function atualizar() {
      var alvo = window.scrollY + window.innerHeight * 0.62;
      var len = Math.max(0, Math.min(LT, alvo - y0));
      tronco.style.strokeDashoffset = LT - len;
      cabeca.setAttribute('cy', y0 + len);
      ramos.forEach(function (b) {
        var ok = alvo >= b.p.y;
        b.luz.style.strokeDashoffset = ok ? 0 : b.L;
        b.p.el.classList.toggle('aceso', ok);
      });
      var agora = len >= LT - 1;
      if (agora !== chegou) {
        chegou = agora;
        cabeca.style.opacity = agora ? 0 : 1;
        ultimo.style.strokeDashoffset = agora ? 0 : LF;
        clearTimeout(temporizador);
        if (agora) {
          temporizador = setTimeout(function () {
            fim.classList.add('aceso');
            if (final) final.classList.add('chegou');
          }, 1000);
        } else {
          fim.classList.remove('aceso');
          if (final) final.classList.remove('chegou');
        }
      }
    }
    trilha = { svg: svg, atualizar: atualizar };
    atualizar();
  }
  aoRolarExtra.push(function () { if (trilha) trilha.atualizar(); });

  var reconstruir = (function () {
    var t = null, largura = window.innerWidth, altura = 0;
    return function (forcar) {
      clearTimeout(t);
      t = setTimeout(function () {
        var h = trilha ? parseFloat(trilha.svg.style.height) : 0;
        if (trilha) trilha.svg.style.height = '0px';
        var novaAltura = document.documentElement.scrollHeight;
        if (trilha) trilha.svg.style.height = h + 'px';
        if (forcar || window.innerWidth !== largura || Math.abs(novaAltura - altura) > 2) {
          largura = window.innerWidth; altura = novaAltura;
          montarTrilha();
        }
      }, 180);
    };
  })();
  window.addEventListener('resize', function () { reconstruir(); });
  window.addEventListener('load', function () { reconstruir(true); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { reconstruir(true); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { reconstruir(); }).observe(document.querySelector('main') || document.body);
  montarTrilha();
  aoRolar();

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
