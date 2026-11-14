#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.argv[2] || 'juego');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
// Check explicit, literal relative URLs in HTML and CSS. Dynamic paths need manual review.
const urls = [...html.matchAll(/(?:src|href)=["'](\\.\\/[^"'#?]+)|url\\(["']?(\\.\\/[^"')?#]+)|fetch\\(\\s*["'](\\.\\/[^"'#?]+)/g)]
  .map(m => m[1] || m[2] || m[3]);
const missing = [...new Set(urls)].filter(url => !fs.existsSync(path.resolve(root, url)));
if (missing.length) {
  console.error('Missing relative assets:', missing.join(', '));
  process.exitCode = 1;
} else {
  console.log('Checked', new Set(urls).size, 'literal relative references; dynamic references require browser validation.');
}
