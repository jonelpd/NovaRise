'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const page of ['index.html', 'en.html']) {
  test(page + ': unique ids and valid local fragment links', () => {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const ids = [...html.matchAll(/\\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'duplicate element ids');
    const idSet = new Set(ids);
    for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(idSet.has(fragment), 'missing fragment #' + fragment);
    }
  });
  test(page + ': vision and transparent token claims', () => {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /id="vision-nvra"/);
    assert.match(html, /0xa1128B1F4CB8394c179eb2558608a7302972EcBF/);
    assert.match(html, /assets\\/site\\.css\\?v=20261117-vision-polish/);
    assert.match(html, /BaseScan/);
  });
}
test('vision CSS supports small screens and reduced motion', () => {
  const css = fs.readFileSync(path.join(root, 'assets/site.css'), 'utf8');
  assert.match(css, /#vision-nvra/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
