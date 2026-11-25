import { fronts, steps, questions, instagram, whatsapp } from './content.mjs';

const icon = (direction = 'diagonal') => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${direction === 'down' ? '<path d="M12 4v15m-6-6 6 6 6-6"/>' : '<path d="M5 19 19 5M8 5h11v11"/>'}</svg>`;
const motionIcon = (paused = false) => `<svg class="icon icon-motion" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paused ? '<path d="m9 5 10 7-10 7z"/>' : '<path d="M8 5v14M16 5v14"/>'}</svg>`;
const contact = (text = 'Fale com a ARVO') => `<a class="action" href="${whatsapp}" target="_blank" rel="noopener noreferrer">${text}<span aria-hidden="true">${icon()}</span></a>`;

export function renderManifesto() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#141a16">
  <meta name="robots" content="index,follow">
  <title>ARVO — Estratégia, comercial e tecnologia</title>
  <meta name="description" content="Estruture seu negócio para lançar ou crescer. A ARVO reúne estratégia, comercial e tecnologia em projetos sob medida.">
  <link rel="canonical" href="https://arvo-advisory.netlify.app/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="ARVO">
  <meta property="og:url" content="https://arvo-advisory.netlify.app/">
  <meta property="og:title" content="ARVO — Estratégia que ganha forma">
  <meta property="og:description" content="Estratégia, comercial e tecnologia para o próximo passo do seu negócio.">
  <meta property="og:image" content="https://arvo-advisory.netlify.app/assets/brand/social-preview.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="ARVO — Estratégia que ganha forma. Negócios que avançam.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="ARVO — Estratégia que ganha forma">
  <meta name="twitter:description" content="Estratégia, comercial e tecnologia para o próximo passo do seu negócio.">
  <meta name="twitter:image" content="https://arvo-advisory.netlify.app/assets/brand/social-preview.png">
  <link rel="icon" type="image/png" href="../assets/brand/tree.png">
  <link rel="apple-touch-icon" href="../assets/brand/tree.png">
  <link rel="stylesheet" href="../assets/manifesto.css">
  <script defer src="../assets/manifesto.js"></script>
</head>
<body>
  <a class="skip" href="#conteudo">Pular para o conteúdo</a>
  <div class="reading-progress" aria-hidden="true"></div>
  <header class="site-header">
    <a class="wordmark" href="#conteudo" aria-label="ARVO, voltar ao início">ARVO<span>ADVISORY</span></a>
    <nav aria-label="Navegação principal"><a href="#frentes">Atuação</a><a href="#processo">Como trabalhamos</a><a href="#sobre">A ARVO</a></nav>
    <a class="nav-contact" href="${whatsapp}" target="_blank" rel="noopener noreferrer">Vamos conversar <span aria-hidden="true">${icon()}</span></a>
  </header>
  <main id="conteudo">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="hero-grid wrap">
        <div class="hero-copy">
          <p class="eyebrow entrance">Estúdio de negócios</p>
          <h1 id="hero-title"><span class="title-line">Estratégia que</span><span class="title-line">ganha forma.</span><span class="title-line accent">Negócios que</span><span class="title-line accent">avançam.</span></h1>
          <p class="hero-lead entrance">Da ideia ao próximo estágio. Estruturamos a oferta, organizamos as vendas e construímos a operação digital do seu negócio.</p>
          <div class="hero-actions entrance">${contact()}<a class="quiet-link" href="#frentes">Explore nossa atuação <span aria-hidden="true">${icon("down")}</span></a></div>
        </div>
        <div class="ecosystem" role="img" aria-label="ARVO conecta estratégia, comercial e tecnologia">
          <div class="coordinate-grid" aria-hidden="true"></div>
          <div class="orbit orbit-a" aria-hidden="true"><i></i></div>
          <div class="orbit orbit-b" aria-hidden="true"><i></i></div>
          <div class="orbit orbit-c" aria-hidden="true"><i></i></div>
          <div class="axis axis-x" aria-hidden="true"></div><div class="axis axis-y" aria-hidden="true"></div>
          <div class="core"><img src="../assets/brand/logo.jpeg" width="640" height="640" alt="" fetchpriority="high"></div>
          <div class="node node-strategy"><span class="node-dot" aria-hidden="true"></span><span>Strategy<small>Estratégia e direção</small></span></div>
          <div class="node node-growth"><span class="node-dot" aria-hidden="true"></span><span>Growth<small>Oferta e comercial</small></span></div>
          <div class="node node-labs"><span class="node-dot" aria-hidden="true"></span><span>Labs<small>Tecnologia e execução</small></span></div>
        </div>
      </div>
      <div class="hero-bottom wrap"><span>Para fundadores, criadores e empresas.</span><button class="motion-toggle" type="button" aria-pressed="false">Pausar movimento <span aria-hidden="true">${motionIcon()}</span></button></div>
    </section>
    <div class="ticker" aria-hidden="true"><div class="ticker-track">${Array.from({length:4},()=>'<span>ESTRATÉGIA</span><i></i><span>COMERCIAL</span><i></i><span>TECNOLOGIA</span><i></i>').join('')}</div></div>
    <section class="intro-section wrap" id="sobre">
      <p class="eyebrow reveal">O seu próximo movimento</p>
      <div class="intro-grid"><h2 class="reveal">Seu negócio tem<br>um próximo passo.<br><span class="muted">Vamos dar forma a ele.</span></h2><div class="intro-copy reveal"><p>Uma ideia precisa de uma oferta clara. Um negócio que já vende precisa conectar atendimento, proposta e presença digital.</p><p>A ARVO identifica a prioridade e reúne as frentes necessárias para executar. Tudo começa pelo que precisa avançar agora.</p></div></div>
      <div class="paths"><a class="path reveal" href="#oferta"><span>Para tirar a ideia do papel</span><strong>Quero lançar.</strong><p>Definir a oferta e preparar a estreia.</p><b aria-hidden="true">${icon()}</b></a><a class="path reveal" href="#diagnostico"><span>Para preparar a próxima etapa</span><strong>Quero crescer.</strong><p>Organizar vendas e operação.</p><b aria-hidden="true">${icon()}</b></a></div>
    </section>
    <section class="fronts-section" id="frentes"><div class="wrap">
      <div class="section-head reveal"><div><p class="eyebrow">Da decisão à entrega</p><h2>Três frentes.<br>Um plano de trabalho.</h2></div><p>Comece por uma frente ou combine as entregas que o seu negócio precisa.</p></div>
      <div class="services">${fronts.map((front,index)=>`<article class="service reveal" id="${front.id}"><div class="service-visual visual-${index}" aria-hidden="true">${index===0?'<div class="scan-ring"></div><div class="scan-ring small"></div><span class="scan-dot d1"></span><span class="scan-dot d2"></span><span class="scan-dot d3"></span><div class="scan-sweep"></div>':index===1?'<div class="offer-layer layer-back">Público</div><div class="offer-layer layer-middle">Proposta de valor</div><div class="offer-layer layer-front">Sua oferta<span>Formato · preço · roteiro</span></div>':'<div class="browser-demo"><div class="browser-top"><i></i><i></i><i></i></div><div class="browser-content"><div class="demo-title"></div><div class="demo-text"></div><div class="demo-text short"></div><div class="demo-button"></div><div class="demo-orb"></div></div><span class="demo-cursor"></span></div>'}</div><div class="service-content"><h3>${front.title}</h3><p>${front.summary}</p><ul>${front.items.map(item=>`<li>${item}</li>`).join('')}</ul><a class="service-link" href="${whatsapp}" target="_blank" rel="noopener noreferrer">Converse sobre ${front.title.toLowerCase()}<span aria-hidden="true">${icon()}</span></a></div></article>`).join('')}</div>
      <p class="scope-note">Escopo, prazo e investimento definidos na proposta, depois da conversa inicial.</p>
    </div></section>
    <section class="process-section wrap" id="processo"><div class="process-heading reveal"><p class="eyebrow">Como a ARVO trabalha</p><h2>Clareza para decidir.<br><span class="muted">Estrutura para executar.</span></h2></div><div class="process-steps">${steps.map((step,index)=>`<article class="process-step reveal"><div class="step-track" aria-hidden="true"><span></span></div><p class="step-label">${['Entender','Planejar','Construir'][index]}</p><h3>${step.title}</h3><p>${step.text}</p></article>`).join('')}</div><div class="responsibility reveal"><span>Construímos com você.</span><p>Você participa das validações e aprova as decisões sobre a marca. A ARVO executa as entregas previstas na proposta.</p></div></section>
    <section class="statement-section"><div class="wrap"><p class="eyebrow reveal">Uma atuação conectada</p><h2 class="reveal">Estruturamos negócios.<br>Organizamos vendas.<br><span>Construímos o digital.</span></h2><div class="statement-line" aria-hidden="true"><i></i></div><p class="reveal">Estratégia, comercial e tecnologia acompanham a mesma direção.</p></div></section>
    <section class="faq-section wrap"><div class="reveal"><p class="eyebrow">Antes da primeira conversa</p><h2>Vamos esclarecer.</h2></div><div class="faq-list reveal">${questions.map(([q,a])=>`<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div></section>
    <section class="contact-section" id="contato"><div class="contact-orbit" aria-hidden="true"></div><div class="wrap"><p class="eyebrow reveal">Seu próximo passo</p><h2 class="reveal">O que vamos<br><span>construir juntos?</span></h2><p class="reveal">Conte em que fase seu negócio está.<br>Envie “ARVO” pelo WhatsApp para iniciar a conversa.</p><div class="reveal">${contact('Comece uma conversa')}</div></div></section>
  </main>
  <footer class="wrap"><a class="wordmark" href="#conteudo">ARVO<span>ADVISORY</span></a><p>Estratégia, comercial e tecnologia.</p><a href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram <span class="footer-icon">${icon()}</span></a></footer>
</body></html>`;
}
