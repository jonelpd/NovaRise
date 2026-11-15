'use strict';
const fs=require('node:fs');
const {convertBulkTrace}=require('./import-bulk-road-trace.cjs');
function decode(line){
 let i=0,x=0,y=0,points=[];
 function number(){let result=0,shift=0,b;do{if(i>=line.length)throw Error('Truncated polyline');b=line.charCodeAt(i++)-63;if(b<0||b>63)throw Error('Invalid polyline');result|=(b&31)<<shift;shift+=5;if(shift>30)throw Error('Polyline overflow')}while(b>=32);return result&1?~(result>>1):result>>1}
 while(i<line.length){x+=number();y+=number();if(x<0||x>1254||y<0||y>1254)throw Error('Point outside map');points.push([+(x/1254).toFixed(6),+(y/1254).toFixed(6)])}
 if(points.length<2)throw Error('Fragment too short');return points;
}
function decodeFile(content){
 const lines=content.split(/\r?\n/).filter(s=>s&&!s.startsWith('#'));
 const fragments=lines.map((line,i)=>({id:'ink-'+String(i+1).padStart(4,'0'),verified:false,points:decode(line)}));
 return {schema_version:1,status:'extracted-unverified',coordinate_system:'normalized',width:1254,height:1254,source_image:'mapa-todas-lineas-negras-trazadas(3).png',fragment_count:fragments.length,points_count:fragments.reduce((n,f)=>n+f.points.length,0),navigation_enabled:false,fragments};
}
if(require.main===module){
 const source=process.argv[2]||'docs/mapa-caminos-actualizados.polyline';
 const output=process.argv[3]||'docs/mapa-caminos-actualizados-grafo.json';
 const result=convertBulkTrace(decodeFile(fs.readFileSync(source,'utf8')));
 fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({fragments:new Set(result.nodes.map(n=>n.source_fragment)).size,nodes:result.nodes.length,edges:result.edges.length,approved:false}));
}
module.exports={decodeFile};
