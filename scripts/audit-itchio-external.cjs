#!/usr/bin/env node
'use strict';
// Audit only: do not change the browser game or assume third-party features are isolated.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(process.argv[2]||'juego');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const checks={
  external_script_import:/import\s*\{[^}]+\}\s*from\s*['"]https?:\/\//.test(html),
  supabase_client:/createClient\s*\(/.test(html),
  remote_auth:/auth\s*:\s*\{/.test(html),
  local_storage:/\blocalStorage\s*\./.test(html),
  external_urls:[...new Set(html.match(/https?:\/\/[^\s'"<>\\)]+/g)||[])].sort()
};
const report={edition:'itchio-candidate',release_approved:false,checks,required_manual_validation:[
 'Open index.html via itch.io iframe HTTPS and verify all asset requests',
 'Test saving and recovering a game after browser restart and iframe storage restrictions',
 'Confirm third-party authentication and Supabase are disabled or explicitly approved for the external edition',
 'Review license and ownership of every bundled visual/audio asset',
 'Verify browser console errors, network requests, CSP and cross-origin restrictions'
]};
const out=path.resolve(process.argv[3]||'dist/itchio-external-audit.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('External-edition audit report:',out);
console.log('External services detected:',checks.supabase_client,'; local storage detected:',checks.local_storage);
