const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'juego/index.html'),'utf8');
const pages=fs.readFileSync(path.join(root,'.github/workflows/pages.yml'),'utf8');

test('NVRA merits are visible but explicitly non-redeemable',()=>{
 for(const id of ['nvra-merit-mines','nvra-merit-treasures','nvra-merit-castles']) assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/no están verificados por un servidor y no generan derechos sobre NVRA/);
 assert.match(html,/La importación o edición de partidas no acredita recompensas/);
 assert.match(html,/Recompensas NVRA: no habilitadas/);
});
test('merit counters only count known sites and deduplicate mines and treasures',()=>{
 assert.match(html,/new Set\(s\.ownedMines\.filter\(k=>mines\.includes\(k\)\)\)\.size/);
 assert.match(html,/new Set\(s\.taken\.filter\(k=>treasures\.includes\(k\)\)\)\.size/);
 assert.match(html,/Object\.prototype\.hasOwnProperty\.call\(CASTLE_PROFILES,k\)&&v==='player'/);
});
test('merit rendering uses textContent and cannot inject HTML through site counts',()=>{
 for(const id of ['meritMines','meritTreasures','meritCastles']) assert.match(html,new RegExp('if\\('+id+'\\)'+id+'\\.textContent='));
});
test('wallet remains suspended while merits are being prepared',()=>{
 assert.match(html,/Conexión de monedero: suspendida temporalmente/);
 assert.doesNotMatch(html,/<script\b[^>]*src=["'][^"']*nvra-wallet-readonly\.js/);
 assert.match(pages,/rm -f _site\/juego\/nvra-wallet-readonly\.js/);
});
