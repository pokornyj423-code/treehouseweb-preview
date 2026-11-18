<!doctype html>
<html lang="cs">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#08110e">
    <meta name="description" content="Nezávislé webové studio. Tvorba a modernizace firemních webů, migrace starého PHP a dlouhodobá správa.">
    <title>Tree House Web — Weby, kterým je rozumět. Technika, která drží krok.</title>
    <link rel="canonical" href="https://treehouseweb.com/index.php?lang=cz">
    <link rel="alternate" hreflang="cs" href="https://treehouseweb.com/index.php?lang=cz">
    <link rel="alternate" hreflang="en" href="https://treehouseweb.com/index.php?lang=en">
    <link rel="alternate" hreflang="de" href="https://treehouseweb.com/index.php?lang=de">
    <link rel="alternate" hreflang="es" href="https://treehouseweb.com/index.php?lang=es">
    <link rel="alternate" hreflang="x-default" href="https://treehouseweb.com/index.php?lang=cz">
    <meta property="og:title" content="TreeHouseWeb">
    <meta property="og:description" content="Nezávislé webové studio. Tvorba a modernizace firemních webů, migrace starého PHP a dlouhodobá správa.">
    <meta property="og:type" content="website">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Manrope:wght@400..800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <script>(function(){var d=document.documentElement;d.setAttribute('data-nav2','');if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('js-anim');try{if(sessionStorage.getItem('thw-wipe')==='1')d.classList.add('wipe-in')}catch(e){}setTimeout(function(){if(!window.__fxReady){d.classList.remove('js-anim');d.classList.remove('wipe-in')}},4500)})()</script>
    <link rel="icon" type="image/svg+xml" href="assets/images/treehouseweb-mark-light.svg">
    <link rel="stylesheet" href="assets/css/site.css">
    <script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"}}</script>
    <script src="assets/js/calculator.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
    <script src="assets/js/nav.js" defer></script>
    <script src="assets/js/fx.js" defer></script>
    <script type="module" src="assets/js/scene.js"></script>
</head>
<body id="top">
<canvas id="scene" aria-hidden="true"></canvas>
<div class="veil" aria-hidden="true"></div>
<div class="fallback-tree" aria-hidden="true"><img src="assets/images/treehouseweb-mark-light.svg" alt="" width="190" height="230"></div>
<a class="skip-link" href="#main">Přejít na obsah</a>
<header class="site-header">
    <a class="brand" href="index.php?lang=cz" aria-label="Tree House Web"><img class="brand-symbol" src="assets/images/treehouseweb-mark-light.svg" alt="" width="34" height="42"><span>Tree House Web<span class="brand-dot">.</span></span></a>
    <button class="menu-toggle icon-button" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Otevřít navigaci" title="Otevřít navigaci"><span class="burger" aria-hidden="true"><i></i><i></i><i></i></span></button>
    <nav id="main-nav" class="main-nav" aria-label="Hlavní navigace"><a href="sluzby.php?lang=cz" style="--i:0"><span>Služby</span></a><a href="3d-web.php?lang=cz" style="--i:1"><span>3D web</span></a><a href="index.php?lang=cz#cenik" style="--i:2"><span>Ceník</span></a><a href="references.php?lang=cz" style="--i:3"><span>Reference</span></a><a href="jak-pracujeme.php?lang=cz" style="--i:4"><span>Jak pracujeme</span></a><a href="estimate.php?lang=cz" style="--i:5"><span>Kalkulace</span></a><div class="menu-foot"><a class="button primary" href="index.php?lang=cz#contact" style="--i:6">Pojďme si napsat</a><a class="menu-mail" href="mailto:info@treehouseweb.com" style="--i:7">info@treehouseweb.com</a><div class="language-switch" role="group" aria-label="Language" style="--i:8"><a href="?lang=cz" lang="cs" hreflang="cs" title="Čeština" aria-current="true">CZ</a><a href="?lang=en" lang="en" hreflang="en" title="English">EN</a><a href="?lang=de" lang="de" hreflang="de" title="Deutsch">DE</a><a href="?lang=es" lang="es" hreflang="es" title="Español">ES</a></div></div></nav>
    <div class="header-end">
        <nav class="language-switch" aria-label="Language"><a href="?lang=cz" lang="cs" hreflang="cs" title="Čeština" aria-current="true">CZ</a><a href="?lang=en" lang="en" hreflang="en" title="English">EN</a><a href="?lang=de" lang="de" hreflang="de" title="Deutsch">DE</a><a href="?lang=es" lang="es" hreflang="es" title="Español">ES</a></nav>
        <a class="header-contact" href="index.php?lang=cz#contact">Pojďme si napsat <img class="icon" src="assets/icons/arrow-up-right.svg" width="18" height="18" alt="" aria-hidden="true"></a>
    </div>
</header>
<main id="main">
    <section class="hero wrap" aria-labelledby="hero-title">
        <div class="hero-surface">
            <p class="eyebrow" data-hero><span class="status-dot"></span>Nezávislé webové studio · Návrh, vývoj, správa</p>
            <h1 id="hero-title" data-split="hero">Tree House Web<span class="brand-dot">.</span></h1>
            <h2 data-split="hero">Weby, kterým je rozumět.<br>Technika, která drží <em>krok.</em></h2>
            <p class="hero-description" data-hero>Tvořím a modernizuji firemní weby. Od jednoduché jednostránkové prezentace až po bezpečnou migraci starého PHP.</p>
            <div class="hero-chips" data-hero>
                <a class="chip" href="#cenik"><span>Normální web</span><strong>9&nbsp;999&nbsp;Kč</strong></a>
                <a class="chip is-3d" href="#cenik"><span>3D web</span><strong>15&nbsp;999&nbsp;Kč</strong></a>
            </div>
            <div class="hero-actions" data-hero>
                <a class="button primary" href="estimate.php?lang=cz" data-intent="estimate">Zjistit cenu webu<img class="icon" src="assets/icons/arrow-up-right.svg" width="20" height="20" alt="" aria-hidden="true"></a>
                <a class="button" href="#cenik">Zobrazit ceník</a>
            </div>
            <p class="hero-note" data-hero>Návrh úvodní stránky předem bez závazků. Doména od 300 Kč ročně.</p>
            <button class="sr-focus" type="button" data-open-window aria-haspopup="dialog">Podívat se do okna domku</button>
            <a class="hero-work" data-hero href="references.php?lang=cz">Prohlédnout reference<img class="icon" src="assets/icons/arrow-right.svg" width="20" height="20" alt="" aria-hidden="true"></a>
        </div>
        <div class="scroll-cue" aria-hidden="true"><i></i>Posuňte dolů, strom se otáčí</div>
        <div class="principle-strip" data-reveal><span><span class="mono">01</span>Nejdřív návrh, potom platba</span><span><span class="mono">02</span>Váš kód. Vaše vlastnictví.</span><span><span class="mono">03</span>Web na roky, ne závislost na dodavateli.</span></div>
    </section>
<div class="marquee" aria-hidden="true"><div class="marquee-track"><span>Normální web 9 999 Kč</span><i>✦</i><span>3D web 15 999 Kč</span><i>✦</i><span>Nejdřív návrh, potom platba</span><i>✦</i><span>Váš kód. Vaše vlastnictví.</span><i>✦</i><span>Web na roky, ne závislost na dodavateli</span><i>✦</i><span>Normální web 9 999 Kč</span><i>✦</i><span>3D web 15 999 Kč</span><i>✦</i><span>Nejdřív návrh, potom platba</span><i>✦</i><span>Váš kód. Vaše vlastnictví.</span><i>✦</i><span>Web na roky, ne závislost na dodavateli</span><i>✦</i></div></div>    <section class="wrap window-teaser" id="okno" aria-labelledby="okno-title">
        <div class="wt-inner panel glow" data-reveal>
            <div class="wt-copy">
                <p class="eyebrow">Světlo v okně</p>
                <h2 id="okno-title">Za oknem se svítí.<br><em>Pojďte se podívat.</em></h2>
                <p>Krátký pohled dovnitř domku: proč vznikl Tree House Web.</p>
                <button class="button primary" type="button" data-open-window aria-haspopup="dialog">Podívat se do okna<img class="icon" src="assets/icons/arrow-right.svg" width="20" height="20" alt="" aria-hidden="true"></button>
            </div>
            <div class="wt-window" aria-hidden="true"><i></i></div>
        </div>
    </section>

    <section class="section wrap" id="services" aria-labelledby="services-title">
        <p class="eyebrow" data-reveal>01 / Co děláme</p>
        <div class="section-heading" data-reveal><h2 id="services-title">Postavit to podstatné.<br><em>Zachovat to dobré.</em></h2><p>Ne každý web potřebuje začít od nuly. Zjistíme, co funguje, co překáží a co vaše podnikání doopravdy potřebuje.</p></div>
        <div class="services-grid">
                    <article class="service">
                <div class="service-number mono">/ 01<span aria-hidden="true">↗</span></div>
                <p class="service-tag mono">Normální web 9 999 Kč · 3D web 15 999 Kč</p>
                <h3>Nový web nebo redesign.<br>Nejdřív si ho prohlédněte.</h3>
                <p>Normální web pořídíte za 9 999 Kč, 3D web s interaktivní scénou a animacemi za 15 999 Kč. Potřebujete obsáhlejší web nebo úpravu stávajícího? Nejdřív připravím návrh úvodní stránky na míru vaší firmě.</p>
                <p class="service-detail">Doména od 300 Kč ročně. Název domény společně vybereme; registraci předem odsouhlasíte a doména bude vedena na vás.</p>
                <a class="text-link" href="#contact" data-intent="preview">Spočítat cenu webu<img class="icon " src="assets/icons/arrow-up-right.svg" width="20" height="20" alt="" aria-hidden="true"></a>
            </article>
                    <article class="service">
                <div class="service-number mono">/ 02<span aria-hidden="true">↳</span></div>
                <p class="service-tag mono">Záchrana PHP, WordPressu a serverů</p>
                <h3>Starý kód.<br>Nový začátek.</h3>
                <p>PHP 5 nebo 7, zastaralé pluginy, křehké databáze. Přeneseme web i data na moderní prostředí s PHP 8, otestujeme důležité funkce a připravíme řízené přepnutí.</p>
                <p class="service-detail">Zálohy, testovací prostředí, kontrola dat a plán návratu. Přechod bez výpadku tam, kde audit potvrdí jeho proveditelnost.</p>
                <a class="text-link" href="#contact" data-intent="migration">Naplánovat migraci<img class="icon " src="assets/icons/arrow-up-right.svg" width="20" height="20" alt="" aria-hidden="true"></a>
            </article>
                    <article class="service">
                <div class="service-number mono">/ 03<span aria-hidden="true">+</span></div>
                <p class="service-tag mono">Vývoj na míru a dlouhodobá správa</p>
                <h3>Na míru vám.<br>S péčí i potom.</h3>
                <p>Přehledné HTML, JavaScript, PHP a WordPress. Vlastní propojení, když je potřebujete. Hosting, zálohy, bezpečnostní aktualizace a smysluplné úpravy po spuštění.</p>
                <p class="service-detail">Jasné vlastnictví, zdokumentované předání a volitelná měsíční péče. Bez povinné uzavřené platformy.</p>
                <a class="text-link" href="estimate.php?lang=cz" >Spočítat projekt<img class="icon " src="assets/icons/arrow-up-right.svg" width="20" height="20" alt="" aria-hidden="true"></a>
            </article>
                </div>
    </section>
<svg class="branch-divider" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true" focusable="false" style="transform:scaleX(-1)"><path class="b" d="M0 40 C120 20 220 58 360 36 S600 12 760 40 S1000 62 1200 30"/><path class="l" d="M130 30 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-30 130 30)"/><path class="l" d="M250 46 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(20 250 46)"/><path class="l" d="M390 34 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-50 390 34)"/><path class="l" d="M520 24 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(10 520 24)"/><path class="l" d="M660 28 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-25 660 28)"/><path class="l" d="M790 38 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(35 790 38)"/><path class="l" d="M930 52 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-10 930 52)"/><path class="l" d="M1060 46 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(25 1060 46)"/><path class="l" d="M1140 36 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-35 1140 36)"/></svg>    <section class="section wrap pricing" id="cenik" aria-labelledby="pricing-title">
        <div class="pricing-head" data-reveal>
            <p class="eyebrow">Ceník</p>
            <h2 id="pricing-title">Dva balíčky.<br><em>Jasná cena.</em></h2>
            <p>Vyberte si čistý, rychlý web, nebo web, který se vám při prvním otevření vrývá do paměti. Stejně jako ten, na který se právě díváte.</p>
        </div>
        <div class="pricing-grid">
            <article class="price-card glow" data-tilt data-reveal>
                <span class="tag">Normální web</span>
                <h3>Čistý web, který funguje</h3>
                <p class="sub">Přehledná firemní prezentace bez zbytečností.</p>
                <p class="price"><strong data-count="9999">9&nbsp;999</strong><span>Kč</span></p>
                <p class="price-note">Orientační cena. Doména od 300 Kč ročně a hosting zvlášť.</p>
                <ul class="price-list">
                    <li>Responzivní web pro mobil, tablet i počítač</li>
                    <li>Přehledná struktura a texty podle vašich podkladů</li>
                    <li>Kontaktní formulář a základní nastavení pro vyhledávače</li>
                    <li>Návrh úvodní stránky předem, platba až potom</li>
                    <li>Váš kód, vaše vlastnictví</li>
                </ul>
                <div class="actions"><a class="button primary" href="#contact" data-intent="preview" data-prefill="Mám zájem o Normální web (9 999 Kč).">Chci normální web</a><a class="button" href="estimate.php?lang=cz">Spočítat v kalkulačce</a></div>
            </article>
            <article class="price-card is-3d glow" data-tilt data-reveal>
                <span class="tag">3D web · Doporučujeme</span>
                <h3>Web s 3D scénou a animacemi</h3>
                <p class="sub">Efekt „tohle musím mít“. Interaktivní, plynulý a rychlý.</p>
                <p class="price"><strong data-count="15999">15&nbsp;999</strong><span>Kč</span></p>
                <p class="price-note">Orientační cena. Doména od 300 Kč ročně a hosting zvlášť.</p>
                <ul class="price-list">
                    <li><strong>Vše z Normálního webu</strong></li>
                    <li>Interaktivní 3D scéna na míru vaší značce (Three.js)</li>
                    <li>Plynulé animace při posouvání a mikrointerakce</li>
                    <li>Web, který si návštěvníci zapamatují a pošlou dál</li>
                    <li>Rychlý a přístupný, respektuje omezení pohybu a má záložní verzi pro slabší zařízení</li>
                </ul>
                <div class="actions"><a class="button primary" href="#contact" data-intent="preview" data-prefill="Mám zájem o 3D web (15 999 Kč).">Chci 3D web</a><a class="button" href="estimate.php?lang=cz">Spočítat v kalkulačce</a></div>
            </article>
        </div>
        <div class="price-compare panel" data-reveal>
            <p><strong>Rozdíl 6 000 Kč</strong> je interaktivní 3D scéna, animace a prémiový dojem. Příplatky (další stránky, jazyk, migrace PHP, měsíční péče) spočítáte v kalkulačce. Konečnou nabídku potvrdíme písemně.</p>
            <a class="text-link" href="estimate.php?lang=cz">Otevřít kalkulačku<img class="icon" src="assets/icons/arrow-up-right.svg" width="18" height="18" alt="" aria-hidden="true"></a>
        </div>
    </section>
<svg class="branch-divider" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="b" d="M0 40 C120 20 220 58 360 36 S600 12 760 40 S1000 62 1200 30"/><path class="l" d="M130 30 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-30 130 30)"/><path class="l" d="M250 46 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(20 250 46)"/><path class="l" d="M390 34 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-50 390 34)"/><path class="l" d="M520 24 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(10 520 24)"/><path class="l" d="M660 28 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-25 660 28)"/><path class="l" d="M790 38 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(35 790 38)"/><path class="l" d="M930 52 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-10 930 52)"/><path class="l" d="M1060 46 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(25 1060 46)"/><path class="l" d="M1140 36 q10 -22 24 -6 q-6 18 -24 6z" transform="rotate(-35 1140 36)"/></svg>
    <section class="section wrap approach-section" id="approach" aria-labelledby="approach-title">
        <div data-reveal><p class="eyebrow">03 / Jednoduchá spolupráce</p><h2 id="approach-title">Rozhovor.<br>Naplánování.<br><em>Poctivá práce.</em></h2><span class="approach-seal mono" aria-hidden="true">THW / OD ROKU 2026<br>MÉNĚ ŠUMU. VÍCE PÉČE.</span></div>
        <ol class="steps"><li><span class="step-number mono">01</span><div><h3>Začneme tím, co je skutečné.</h3><p>Řekněte nám o firmě, webu a věcech, které vás na něm štvou. Nejdřív posloucháme, pak doporučujeme.</p></div></li><li><span class="step-number mono">02</span><div><h3>Nejdřív se podíváte.</h3><p>U redesignu uvidíte živý návrh úvodní stránky. U migrace audit a konkrétní plán. Rozsah i cenu domluvíme před placenou prací.</p></div></li><li><span class="step-number mono">03</span><div><h3>Spustíme a předáme.</h3><p>Otestujeme, zdokumentujeme a předáme. Klíče i soubory zůstávají vám. Nebo se o web dál staráme. Je to na vás.</p></div></li></ol>
    </section>
<div class="marquee rev" aria-hidden="true"><div class="marquee-track"><span>Normální web 9 999 Kč</span><i>✦</i><span>3D web 15 999 Kč</span><i>✦</i><span>Nejdřív návrh, potom platba</span><i>✦</i><span>Váš kód. Vaše vlastnictví.</span><i>✦</i><span>Web na roky, ne závislost na dodavateli</span><i>✦</i><span>Normální web 9 999 Kč</span><i>✦</i><span>3D web 15 999 Kč</span><i>✦</i><span>Nejdřív návrh, potom platba</span><i>✦</i><span>Váš kód. Vaše vlastnictví.</span><i>✦</i><span>Web na roky, ne závislost na dodavateli</span><i>✦</i></div></div>
    <section class="section wrap contact-section" id="contact" aria-labelledby="contact-title">
        <div class="contact-intro"><p class="eyebrow section-label">05 / Pojďme vytvořit něco užitečného</p><h2 id="contact-title">Co máte<br>v plánu?</h2><p>Starý web, nový nápad nebo kód, který potřebuje pečlivé ruce. Tady můžeme začít.</p><div class="direct-email"><span class="mono">Raději přímo e-mailem?</span><a href="mailto:info@treehouseweb.com">info@treehouseweb.com <img class="icon " src="assets/icons/arrow-up-right.svg" width="20" height="20" alt="" aria-hidden="true"></a></div><p class="contact-note">Žádná prodejní série. Jen člověk, který si přečte vaši zprávu.</p></div>
        <form action="contact.php" method="post" id="contact-form">
            <input type="hidden" name="csrf" value="__CSRF__"><input type="hidden" name="form_token" value="__FORM_TOKEN__"><input type="hidden" name="lang" value="cz"><input type="hidden" name="estimate" id="estimate-payload" value="">
            <div class="honeypot" aria-hidden="true"><label for="company-fax">Fax</label><input id="company-fax" name="company_fax" type="text" tabindex="-1" autocomplete="off"></div>
            <div class="form-row"><label>Vaše jméno<input name="name" id="contact-name" required maxlength="100" autocomplete="name" value=""></label><label>E-mail<input name="email" type="email" required maxlength="254" autocomplete="email" value=""></label></div>
            <label>Současný web (nepovinné)<input name="website" type="url" maxlength="500" placeholder="https://vas-web.cz" autocomplete="url" value=""></label>
            <label>Co vás zajímá?<select name="intent" id="contact-intent"><option value="estimate">Probrat kalkulaci</option><option value="preview">Nezávazný návrh úvodní stránky</option><option value="migration">Audit migrace</option></select></label>
            <label>Pár slov o projektu<textarea name="message" required minlength="10" maxlength="5000" rows="4" placeholder="Co by se mělo změnit? Co má zůstat?"></textarea></label>
            <label class="consent"><input type="checkbox" name="privacy_acknowledged" value="1"><span>Seznámil/a jsem se se zásadami ochrany osobních údajů. <a href="privacy.php?lang=cz">Jak nakládáme s údaji</a></span></label>
            <button type="submit" class="button primary" id="send-enquiry"><span>Odeslat poptávku</span><img class="icon " src="assets/icons/arrow-up-right.svg" width="20" height="20" alt="" aria-hidden="true"></button>
            <p class="form-status " id="form-status" role="status" aria-live="polite"></p>
        </form>
    </section>
</main>
<footer class="site-footer"><div class="wrap"><div class="footer-top"><a class="brand" href="index.php?lang=cz"><img class="brand-symbol" src="assets/images/treehouseweb-mark-light.svg" alt="" width="34" height="42"><span>Tree House Web<span class="brand-dot">.</span></span></a><p>Nezávisle. Promyšleně. Poctivě.</p><a class="text-link" href="index.php?lang=cz#top">Zpět nahoru<img class="icon" src="assets/icons/arrow-up-right.svg" width="18" height="18" alt="" aria-hidden="true"></a></div><nav class="footer-legal" aria-label="Stránky"><a href="sluzby.php?lang=cz">Služby</a><a href="normalni-web.php?lang=cz">Normální web</a><a href="3d-web.php?lang=cz">3D web</a><a href="jak-pracujeme.php?lang=cz">Jak pracujeme</a><a href="references.php?lang=cz">Reference</a></nav><nav class="footer-legal" aria-label="Legal information"><a href="privacy.php?lang=cz">Soukromí</a><a href="legal-notice.php?lang=cz">Identifikace provozovatele</a><a href="terms.php?lang=cz">Podmínky spolupráce</a><a href="admin.php?lang=cz">Správa studia ↗</a></nav><div class="footer-bottom mono"><span>© 2026 TreeHouseWeb. Webové řemeslo a modernizace starších systémů.</span></div></div></footer>
<div class="winview" id="winview" role="dialog" aria-modal="true" aria-labelledby="wv-title" hidden>
    <button class="wv-close" type="button"><span>Zpět ven</span><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg></button>
    <div class="wv-grid">
        <div class="wv-frame">
            <svg class="wv-il" viewBox="0 0 480 360" role="img" aria-label="Ilustrace: člověk u počítače přemýšlí, kdo mu udělá web. Na obrazovce se objeví Tree House Web.">
                <defs>
                    <radialGradient id="lampGlow"><stop offset="0" stop-color="#ffb454" stop-opacity=".55"/><stop offset="1" stop-color="#ffb454" stop-opacity="0"/></radialGradient>
                    <radialGradient id="screenGlow"><stop offset="0" stop-color="#86d6a2" stop-opacity=".5"/><stop offset="1" stop-color="#86d6a2" stop-opacity="0"/></radialGradient>
                </defs>
                <circle cx="408" cy="205" r="120" fill="url(#lampGlow)" class="il-lamp-glow"/>
                <ellipse cx="255" cy="244" rx="170" ry="120" fill="url(#screenGlow)" class="il-glow"/>
                <path d="M408 304V222" stroke="#b07a52" stroke-width="5" stroke-linecap="round"/>
                <path d="M384 224L432 224L420 186L396 186Z" fill="#ffb454"/>
                <rect x="30" y="302" width="430" height="10" rx="4" fill="#6b4630"/>
                <path d="M64 312v44M426 312v44" stroke="#4a3022" stroke-width="8" stroke-linecap="round"/>
                <rect x="38" y="222" width="104" height="84" rx="18" fill="#1a2822"/>
                <path d="M58 304C58 244 76 222 108 222C140 222 158 244 158 304Z" fill="#2b3d34" stroke="#ffb454" stroke-opacity=".28" stroke-width="2"/>
                <circle cx="108" cy="194" r="25" fill="#34493e" stroke="#ffb454" stroke-opacity=".3" stroke-width="2"/>
                <path d="M152 270C172 258 166 222 136 210" stroke="#34493e" stroke-width="15" fill="none" stroke-linecap="round"/>
                <rect x="172" y="190" width="170" height="110" rx="9" fill="#0b1712" stroke="#3f6350" stroke-width="3"/>
                <path d="M152 302h210l-13-9H165z" fill="#25372e"/>
                <g class="il-search">
                    <rect x="190" y="206" width="134" height="22" rx="11" fill="none" stroke="#86d6a2" stroke-opacity=".7" stroke-width="1.6"/>
                    <circle cx="203" cy="217" r="4.5" fill="none" stroke="#86d6a2" stroke-width="1.6"/><path d="M207 221l4 4" stroke="#86d6a2" stroke-width="1.6" stroke-linecap="round"/>
                    <text x="218" y="221" font-size="11" fill="#b9c6b8" font-family="Manrope,sans-serif">web na míru…</text>
                    <rect x="190" y="244" width="112" height="6" rx="3" fill="#41584c"/><rect x="190" y="259" width="86" height="6" rx="3" fill="#41584c"/><rect x="190" y="274" width="120" height="6" rx="3" fill="#41584c"/>
                </g>
                <g class="il-solved">
                    <image href="assets/images/treehouseweb-mark-light.svg" x="231" y="200" width="48" height="58"/>
                    <text x="255" y="282" font-size="14" text-anchor="middle" fill="#f1f4ec" font-family="Fraunces,serif" font-weight="600">Tree House Web<tspan fill="#ffb454">.</tspan></text>
                </g>
                <circle cx="146" cy="160" r="3.5" fill="none" stroke="#f1f4ec" stroke-opacity=".7"/><circle cx="158" cy="143" r="6" fill="none" stroke="#f1f4ec" stroke-opacity=".7"/>
                <ellipse cx="200" cy="96" rx="44" ry="32" fill="rgba(8,17,14,.55)" stroke="#f1f4ec" stroke-opacity=".8" stroke-width="1.6"/>
                <text class="il-q" x="200" y="111" font-size="44" text-anchor="middle" fill="#ffb454" font-family="Fraunces,serif">?</text>
                <path class="il-ok" d="M181 98l13 14 26-30" fill="none" stroke="#86d6a2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="wv-copy" aria-live="polite">
            <div class="wv-step is-active">
                <p class="eyebrow">Zná to hodně lidí</p>
                <h2 id="wv-title">Potřebujete web.<br><em>Jen nevíte, koho se zeptat.</em></h2>
                <p>Nabídek je spousta, srozumitelných odpovědí málo.</p>
                <button class="button primary wv-next" type="button">Co s tím?<img class="icon" src="assets/icons/arrow-right.svg" width="20" height="20" alt="" aria-hidden="true"></button>
            </div>
            <div class="wv-step" aria-hidden="true">
                <p class="eyebrow">Tree House Web.</p>
                <h2>Weby, kterým<br><em>je rozumět.</em></h2>
                <p>Nejdřív návrh, potom platba. Váš kód, vaše vlastnictví. Normální web 9&nbsp;999 Kč, 3D web 15&nbsp;999 Kč.</p>
                <div class="hero-actions"><a class="button primary" href="estimate.php?lang=cz">Zjistit cenu webu<img class="icon" src="assets/icons/arrow-up-right.svg" width="20" height="20" alt="" aria-hidden="true"></a><a class="button" href="#contact" data-close-window>Napsat poptávku</a></div>
            </div>
            <div class="wv-dots" aria-hidden="true"><i class="on"></i><i></i></div>
        </div>
    </div>
</div>
<script src="assets/js/story.js" defer></script>
</body>
</html>
