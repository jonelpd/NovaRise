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
    const target=filePart.split("?")[0] || page;
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
