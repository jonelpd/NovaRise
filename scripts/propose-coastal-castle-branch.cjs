#!/usr/bin/env node
'use strict';
// Genera SOLO una máscara candidata, nunca sobrescribe la máscara del juego.
// Uso: node scripts/propose-coastal-castle-branch.cjs
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'juego/rutas-turquesa-160.json'),'utf8'));
const proposal=JSON.parse(fs.readFileSync(path.join(root,'docs/ramal-castillo-costero-propuesta-2026-11-16.json'),'utf8'));
assert.equal(source.resolution,160);
assert.equal(source.encoding,'zlib-base64-bitset-msb');
assert.equal(proposal.status,'PROPOSED_NOT_DEPLOYED');
const size=160,raw=zlib.inflateSync(Buffer.from(source.compressed,'base64'));
assert.equal(raw.length,3200);
const cells=new Uint8Array(25600);
for(let i=0;i<cells.length;i++)cells[i]=(raw[i>>3]>>(7-(i&7)))&1;
const originalCount=cells.reduce((a,b)=>a+b,0);
assert.equal(originalCount,source.road_cells);
const points=proposal.polyline_px;
const toCell=([x,y])=>[Math.floor(x/1254*160),Math.floor(y/1254*160)];
const anchor=toCell(points[0]);
const anchorIndex=anchor[1]*160+anchor[0];
const anchorNearby=[];
for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
 const x=anchor[0]+dx,y=anchor[1]+dy;
 if(x>=0&&x<size&&y>=0&&y<size&&cells[y*size+x])anchorNearby.push([x,y]);
}
if(!anchorNearby.length)throw Error('Anclaje sin camino oficial a menos de dos celdas: revisar manualmente');
const additions=[];
for(let j=1;j<points.length;j++){
 const [ax,ay]=toCell(points[j-1]),[bx,by]=toCell(points[j]);
 const steps=Math.max(Math.abs(bx-ax),Math.abs(by-ay),1)*8;
 for(let k=0;k<=steps;k++){
  const x=Math.round(ax+(bx-ax)*k/steps),y=Math.round(ay+(by-ay)*k/steps);
  if(x<1||y<1||x>=size-1||y>=size-1)throw Error('Ramal fuera del mapa');
  const i=y*size+x;
  if(!cells[i]){cells[i]=1;additions.push([x,y])}
 }
}
const packed=Buffer.alloc(3200);
for(let i=0;i<cells.length;i++)if(cells[i])packed[i>>3]|=1<<(7-(i&7));
const candidate={...source,road_cells:originalCount+additions.length,compressed:zlib.deflateSync(packed).toString('base64'),source:'CANDIDATE coastal castle staircase branch; NOT approved for deployment'};
const output=path.join(root,'coastal-castle-branch-candidate.json');
fs.writeFileSync(output,JSON.stringify(candidate,null,2)+'\n');
console.log(JSON.stringify({status:'CANDIDATE_ONLY',anchor,anchorNearby,staircase:toCell(points[points.length-1]),new_cells:additions.length,added:additions,output},null,2));
