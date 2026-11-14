'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
test('guest edition build excludes remote auth without changing NovaRise source',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'itchio-'));
 try{
  const original=fs.readFileSync('juego/index.html','utf8');
  cp.execFileSync(process.execPath,['scripts/build-itchio-guest.cjs','juego',tmp]);
  const built=fs.readFileSync(path.join(tmp,'index.html'),'utf8');
  assert.equal(fs.readFileSync('juego/index.html','utf8'),original);
  assert.match(built,/itchio-guest-bootstrap/);
  assert.match(built,/nvrSwitchPlayer\('itchio-guest-v1'\)/);
  assert.doesNotMatch(built,/esm\.sh\/@supabase|spaafpqczvqahhwjxxrz\.supabase\.co|createClient\s*\(/);
  assert.match(built,/id="game-screen"/);
  assert.equal(fs.existsSync(path.join(tmp,'nvra-wallet-readonly.js')),false);
  assert.equal(fs.existsSync(path.join(tmp,'nvra-merit-validation.cjs')),false);
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
});
