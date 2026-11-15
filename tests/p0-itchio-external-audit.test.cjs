'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const audit=fs.readFileSync('scripts/audit-itchio-external.cjs','utf8');
test('itch.io audit checks wallet access and residual NVRA',()=>{
 for(const marker of ['nvra_mentions','nvra_center_markup','wallet_connection','ethereum_provider','token_transfer','process.exitCode=1','release_approved:false']){
  assert.ok(audit.includes(marker),'Missing audit control: '+marker);
 }
});
