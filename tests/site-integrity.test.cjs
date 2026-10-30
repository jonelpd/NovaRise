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
  assert.match(text[page],/id="address"/);
  assert.match(text[page],/id="analyze"/);
  assert.match(text[page],/src="assets\/analyzer\.js/);
  assert.match(text[page],/src="assets\/locale-en\.js/);
}
assert.match(text["base-portal.html"],/base-portal-en\.html/);
assert.match(text["base-portal-en.html"],/base-portal\.html/);
assert.match(text["base-portal.html"],/NVRA aún no está desplegado/);
assert.match(text["base-portal-en.html"],/NVRA has not been deployed/);
assert.deepEqual(issues,[],issues.join("\n"));
console.log("PASS: "+pages.length+" HTML pages, local links, anchors, Base disclosures and language navigation");
