"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");
const pages = [
  "index.html","en.html","libro-blanco.html","whitepaper-en.html",
  "tokenomics.html","tokenomics-en.html","base-portal.html","base-portal-en.html",
  "crm.html"
];
const text = Object.fromEntries(pages.map(p => [p,fs.readFileSync(p,"utf8")]));
const issues = [];
for (const [page,html] of Object.entries(text)) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if (ids.length !== new Set(ids).size) issues.push(page+": duplicate IDs");
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href=match[1];
    if (/^(?:https?:|mailto:|tel:|data:)/.test(href)) continue;
    if (/^javascript:/i.test(href)) { issues.push(page+": unsafe URL "+href); continue; }
    const [filePart,fragment]=href.split("#");
    const rawTarget=filePart.split("?")[0] || page;
    const target=rawTarget.endsWith("/") ? rawTarget+"index.html" : rawTarget;
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      issues.push(page+": missing local file "+target);
      continue;
    }
    if (fragment && text[target] && !text[target].includes('id="'+fragment+'"')) {
      issues.push(page+": missing anchor "+href);
    }
  }
}
for (const page of ["index.html","en.html"]) {
  assert.match(text[page],/Base Mainnet/);
  assert.match(text[page],/1[.,]000[.,]000|1[.]000[.]000/);
  assert.doesNotMatch(text[page],/Amoy|testnet|access-pass/i);
  assert.match(text[page],/class="simple-cards"/);
  assert.match(text[page],/id="analizador"/);
  assert.match(text[page],/id="participacion"/);
  assert.match(text[page],/id="interest-form"/);
  assert.match(text[page],/name="suggestion"/);
  assert.match(text[page],/name="consent" required/);
  assert.match(text[page],/id="interest-success-modal"/);
  assert.match(text[page],/src="assets\/interest\.js/);
  assert.match(text[page],/id="network"/);
  assert.match(text[page],/<select id="network"><option selected>Base<\/option>/);
  assert.match(text[page],/id="address"/);
  assert.match(text[page],/id="analyze"/);
  assert.match(text[page],/src="assets\/analyzer\.js/);
  assert.match(text[page],/src="assets\/locale-en\.js/);
  assert.match(text[page],/<a href="crm\.html" aria-label="(?:Acceso administrador|Admin access)">/);
}
assert.match(text["base-portal.html"],/base-portal-en\.html/);
assert.match(text["base-portal-en.html"],/base-portal\.html/);
assert.match(text["base-portal.html"],/NVRA aún no está desplegado/);
assert.match(text["base-portal-en.html"],/NVRA has not been deployed/);
const analyzer=fs.readFileSync("assets/analyzer.js","utf8");
assert.match(analyzer,/['"]Base['"]:['"]8453['"]/);
assert.match(analyzer,/['"]Base['"]:['"]base['"]/);
assert.match(analyzer,/if\(yearElement\)yearElement\.textContent/);
assert.match(analyzer,/selected\.sort\(\(a,b\)=>\(safeNumber\(b\.liquidity\?\.usd\)\|\|0\)-\(safeNumber\(a\.liquidity\?\.usd\)\|\|0\)\)/);
assert.match(analyzer,/metricCard\(nvraText\('Liquidez del par'\),usd\(top\.liquidity\?\.usd\)/);
assert.match(analyzer,/no equivale a fondos bloqueados/);
assert.match(analyzer,/No se suman los pares para evitar conclusiones engañosas/);
assert.match(analyzer,/no se sustituye por la variación de otro par/);
assert.match(analyzer,/pricePair\?\.priceChange\?\.h24/);
assert.match(analyzer,/Executive summary/);
assert.match(analyzer,/Resumen ejecutivo/);
assert.match(analyzer,/Market overview/);
assert.match(analyzer,/Resumen de mercado/);
assert.match(analyzer,/Indicadores de riesgo por categoría/);
assert.match(analyzer,/Risk indicators by category/);
assert.match(analyzer,/const indicatorGuides=/);
assert.match(analyzer,/Por qué importa:/);
assert.match(analyzer,/Calidad y procedencia de los datos/);
assert.match(analyzer,/Data quality and sources/);
assert.match(analyzer,/Alcance y metodología/);
assert.match(analyzer,/Scope and methodology/);
assert.match(analyzer,/https:\/\/gopluslabs\.io\//);
assert.match(analyzer,/https:\/\/dexscreener\.com\//);
assert.match(analyzer,/https:\/\/www\.geckoterminal\.com\//);
assert.match(analyzer,/Hora de consulta, no necesariamente la fecha de actualización del proveedor/);
assert.match(analyzer,/Retrieval time, not necessarily the provider data timestamp/);
assert.match(analyzer,/dataQualityCard\('GoPlus Security API',known,0,unavailable\)/);
assert.match(analyzer,/dataQualityCard\('DexScreener',reportedMarket,estimatedMarket/);
assert.match(analyzer,/Why it matters:/);
assert.match(analyzer,/indicatorGuides\[field\.key\]/);
assert.match(analyzer,/Los datos ausentes nunca cuentan como resultado favorable/);
assert.match(analyzer,/keys:\['is_honeypot','is_blacklisted'\]/);
assert.match(analyzer,/Highest reported liquidity among/);
assert.match(analyzer,/Es un único par, no la liquidez total del token/);
assert.match(analyzer,/results\.filter\(item=>item\.state==='alert'\)/);
assert.match(analyzer,/selectedPeriod===1\?nvraText\('Seleccionar hora del histórico'\):nvraText\('Seleccionar día del histórico'\)/);
const interestJs=fs.readFileSync("assets/interest.js","utf8");
const crmJs=fs.readFileSync("assets/crm.js","utf8");
assert.match(interestJs,/novarise-interest/);
assert.match(interestJs,/data\.consent=form\.elements\.consent\.checked/);
assert.match(interestJs,/openSuccess\(\)/);
assert.match(interestJs,/rate_limited/);
assert.match(interestJs,/if\(!form\.reportValidity\(\)\)return/);
assert.match(interestJs,/if\(!response\.ok\|\|!result\.ok\)throw/);
assert.match(interestJs,/finally\{button\.disabled=false\}/);
assert.match(crmJs,/if\(!user\)\{showLogin\(\);return\}/);
assert.match(crmJs,/if\(error\|\|!data\)\{await db\.auth\.signOut\(\)/);
assert.match(crmJs,/if\(!confirm\('¿Eliminar definitivamente este registro\?/);
assert.match(crmJs,/if\(error\|\|!data\?\.length\)/);
assert.match(crmJs,/from\('novarise_admins'\)/);
assert.match(crmJs,/escapeHtml\(r\.suggestion\)/);
assert.match(crmJs,/from\('novarise_interests'\)/);
assert.match(crmJs,/from\('novarise_public_ideas'\)/);
assert.deepEqual(issues,[],issues.join("\n"));
console.log("PASS: "+pages.length+" HTML pages, local links, anchors, Base disclosures and language navigation");

// Community publications require explicit bilingual and privacy review before going live.
const crmSource=fs.readFileSync('assets/crm.js','utf8');
assert.ok(crmSource.includes('Revisión final antes de publicar.'),'Missing publication review prompt');
assert.ok(crmSource.includes('Title EN: ')&&crmSource.includes('Título ES: '),'Both language titles must appear in publication review');
assert.ok(crmSource.includes('Description EN: ')&&crmSource.includes('Descripción ES: '),'Both language descriptions must appear in publication review');
assert.ok(crmSource.includes('datos personales'),'Privacy review reminder must appear before publication');

// The private moderation dashboard must support independent triage filters.
const crmMarkup=fs.readFileSync('crm.html','utf8');
for(const id of ['idea-summary','idea-priority-filter','idea-feasibility-filter'])assert.ok(crmMarkup.includes('id="'+id+'"'),'Missing CRM moderation control: '+id);
for(const id of ['idea-priority-filter','idea-feasibility-filter'])assert.ok(crmSource.includes("$('"+id+"').value"),'CRM moderation filter not wired: '+id);
assert.ok(crmSource.includes("$('idea-summary').textContent"),'Moderation status overview must update from records');

// Moderation guidance must be available in the private CRM without exposing participant data.
assert.ok(fs.readFileSync('crm.html','utf8').includes('class="idea-review-guide"'),'CRM moderation guide missing');
assert.ok(fs.readFileSync('crm.html','utf8').includes('No copies nombres, correos'),'CRM privacy guidance missing');

// Phase 3 participation: both languages explain privacy and expose a live character counter.
for(const file of ['index.html','en.html']){const markup=fs.readFileSync(file,'utf8');for(const id of ['suggestion-guidance','suggestion-counter'])assert.ok(markup.includes('id="'+id+'"'),file+' missing '+id);assert.ok(markup.includes('aria-describedby="suggestion-guidance suggestion-counter"'),file+' missing accessible suggestion description');}
const interestSource=fs.readFileSync('assets/interest.js','utf8');assert.ok(interestSource.includes('updateCounter();openSuccess()'),'Counter must reset after successful submission');

// Public updates must be bilingual, traceable and explicit that NVRA is not launched.
for(const [file,id] of [['index.html','actualizaciones'],['en.html','updates']]){const markup=fs.readFileSync(file,'utf8');assert.ok(markup.includes('id="'+id+'"'),file+' missing updates section');assert.ok(!markup.includes('github.com/'),file+' exposes GitHub links');assert.ok(markup.includes('4 November 2026')||markup.includes('4 de noviembre de 2026'),file+' missing editorial date');}

// Phase 3.3: public dated history and navigation must be bilingual and source-backed.
for(const [file,anchor] of [['index.html','actualizaciones'],['en.html','updates']]){const markup=fs.readFileSync(file,'utf8');assert.ok(markup.includes('<a href="#'+anchor+'">'),file+' missing updates nav');assert.ok(markup.includes('class="updates-history"'),file+' missing development log');assert.ok(!markup.includes('github.com/'),file+' exposes repository links');assert.ok(markup.includes('<time datetime="2026-11-04">'),file+' missing dated entries');}

// The public updates history has responsive and keyboard-visible styles.
const updatesCss=fs.readFileSync('assets/site.css','utf8');assert.ok(updatesCss.includes('.updates-history a:focus-visible'),'Missing keyboard focus for history links');assert.ok(updatesCss.includes('@media(max-width:600px){.updates-history'),'Missing mobile history layout');

// Phase 3.3: bilingual manually curated Atom feeds and discoverability.
for(const [html,feed] of [['index.html','actualizaciones.atom'],['en.html','updates-en.atom']]){const page=fs.readFileSync(html,'utf8');const xml=fs.readFileSync(feed,'utf8');assert.ok(page.includes('rel="alternate" type="application/atom+xml"'),html+' missing feed discovery');assert.ok(page.includes('href="'+feed+'"'),html+' missing feed link');assert.ok(xml.includes('xmlns="http://www.w3.org/2005/Atom"'),feed+' missing Atom namespace');for(const pr of [61,62,64])assert.ok(xml.includes('novarise-update-'+pr),feed+' missing stable milestone '+pr);assert.ok(!xml.includes('github.com/'),feed+' exposes repository links');}

// No public page or update feed may link directly to the code repository.
for(const file of ['index.html','en.html','actualizaciones.atom','updates-en.atom'])assert.ok(!fs.readFileSync(file,'utf8').includes('github.com/'),file+' must not link to GitHub');
