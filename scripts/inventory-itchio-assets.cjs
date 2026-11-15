#!/usr/bin/env node
'use strict';
// Inventory bundled assets, without assuming ownership or permission to redistribute.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||'dist/itchio');
const output=path.resolve(process.argv[3]||'dist/itchio-assets-inventory.json');
const extensions=new Set(['.png','.jpg','.jpeg','.webp','.gif','.svg','.ico','.bmp','.avif','.mp3','.wav','.ogg','.m4a','.flac','.mp4','.webm','.woff','.woff2','.ttf','.otf']);
const files=[];
function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())walk(full);
  else if(entry.isFile()&&extensions.has(path.extname(entry.name).toLowerCase())){
   const bytes=fs.readFileSync(full);
   files.push({path:path.relative(root,full).split(path.sep).join('/'),type:path.extname(entry.name).toLowerCase(),size_bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),author:null,origin_url:null,license:null,license_evidence:null,redistribution_approved:false});
  }
 }
}
walk(root);
const report={edition:'itchio-candidate',release_approved:false,asset_count:files.length,approved_count:0,review_required:files.length,notice:'Unknown license is not permission. Complete ownership and redistribution evidence for each asset before public release.',assets:files};
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log('Asset inventory:',files.length,'bundled media/font files; all require ownership/license review');
