const nvraLocale=document.documentElement?.lang==='en'?'en':'es';
function nvraText(source){return nvraLocale==='en'?(nvraEnglish[source]??source):source;}

const addrInput=document.getElementById('address');
const netInput=document.getElementById('network');
const report=document.getElementById('report');
const empty=document.getElementById('empty');
const analyzeButton=document.getElementById('analyze');
const endpointChains={'Ethereum':'1','Polygon':'137','BNB Smart Chain':'56'};
const dexChains={'Ethereum':'ethereum','Polygon':'polygon','BNB Smart Chain':'bsc'};
const fields=[
 {key:'is_open_source',label:nvraText('Código fuente verificado'),good:'1',positive:nvraText('El proveedor indica que el código está publicado para revisión. Esto no equivale a una auditoría.'),negative:nvraText('El proveedor no identifica el código como abierto/verificado; revisar antes de confiar.')},
 {key:'is_honeypot',label:nvraText('Posible bloqueo de ventas'),good:'0',positive:nvraText('GoPlus no señala un patrón de bloqueo de ventas en este indicador. No garantiza que puedas vender.'),negative:nvraText('GoPlus señala posible restricción de venta. Investiga antes de operar.')},
 {key:'is_mintable',label:nvraText('Emisión adicional de tokens'),good:'0',positive:nvraText('No se señala capacidad de emisión adicional en este indicador.'),negative:nvraText('Podría existir capacidad de crear nuevos tokens y alterar su oferta.')},
 {key:'is_blacklisted',label:nvraText('Lista negra de direcciones'),good:'0',positive:nvraText('No se señala una función de bloqueo por direcciones en este indicador.'),negative:nvraText('El contrato podría bloquear direcciones concretas.')},
 {key:'can_take_back_ownership',label:nvraText('Recuperación de propiedad'),good:'0',positive:nvraText('No se señala capacidad de recuperar privilegios administrativos en este indicador.'),negative:nvraText('Podría existir capacidad de recuperar el control administrativo.')},
 {key:'is_proxy',label:nvraText('Contrato proxy'),good:'0',positive:nvraText('No se señala estructura proxy en este indicador.'),negative:nvraText('Se señala una estructura proxy; su lógica podría modificarse, según permisos.')}
];
document.getElementById('year').textContent=new Date().getFullYear();
let activeRequest=0;
let securityController=null;
let marketController=null;
let historyController=null;
const geckoChains={'Ethereum':'eth','Polygon':'polygon_pos','BNB Smart Chain':'bsc'};
let historyPeriod=30;
let historyMetric='price';
let lastHistoricalPair=null;
let lastHistoricalNetwork=null;
let lastHistoricalRequest=null;
function cancelPending(){
 if(securityController){securityController.abort();securityController=null;}
 if(marketController){marketController.abort();marketController=null;}
 if(historyController){historyController.abort();historyController=null;}
}
function element(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;}
function safeNumber(value){
 if(value===null||value===undefined||value===''||typeof value==='boolean'||typeof value==='object')return null;
 const n=Number(value);return Number.isFinite(n)&&n>=0?n:null;
}
function metricCard(label,value,note){
 const card=element('div','metric');card.append(element('small','',label),element('strong','',value),element('em','',note));return card;
}
function formatCount(value){const n=safeNumber(value);return n===null?nvraText('Sin datos'):new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(n);}
function percentage(value){
 const n=safeNumber(value);
 return n===null||n>1?null:n*100;
}
function appendDashboard(token){
 report.append(element('h4','section-title',nvraText('Panel de mercado y titulares')));
 const dashboard=element('div','dashboard');
 const symbol=typeof token.token_symbol==='string'&&token.token_symbol.trim()?token.token_symbol.trim().slice(0,35):nvraText('Sin datos');
 const name=typeof token.token_name==='string'&&token.token_name.trim()?token.token_name.trim().slice(0,65):nvraText('Sin datos');
 dashboard.append(metricCard('Token',symbol,name));
 dashboard.append(metricCard(nvraText('Titulares reportados'),formatCount(token.holder_count),nvraText('Número facilitado por GoPlus; puede faltar.')));
 const supply=safeNumber(token.total_supply);
 dashboard.append(metricCard('Suministro reportado',supply===null?nvraText('Sin datos'):new Intl.NumberFormat('es-ES',{maximumSignificantDigits:7}).format(supply),nvraText('Dato del proveedor; unidad del token.')));
 const holders=Array.isArray(token.holders)?token.holders:[];
 const shares=holders.map(h=>percentage(h&&h.percent));
 const completeTop10=holders.length>=10&&shares.slice(0,10).every(n=>n!==null);
 const concentration=completeTop10?shares.slice(0,10).reduce((a,b)=>a+b,0):null;
 dashboard.append(metricCard(nvraText('Concentración de 10 direcciones'),concentration===null||concentration>100.00001?nvraText('Sin datos'):concentration.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:2})+' %',nvraText('Solo si GoPlus aporta 10 porcentajes válidos; pueden incluir contratos.')));
 const liquidity=safeNumber(token.lp_total_supply);
 dashboard.append(metricCard(nvraText('Suministro de tokens LP'),liquidity===null?nvraText('Sin datos'):new Intl.NumberFormat('es-ES',{maximumSignificantDigits:7}).format(liquidity),nvraText('No equivale a liquidez en USD ni demuestra que esté bloqueada.')));
 dashboard.append(metricCard(nvraText('Titulares LP reportados'),formatCount(token.lp_holder_count),nvraText('Conteo declarado por GoPlus, si está disponible.')));
 report.append(dashboard);
 report.append(element('p','small muted',nvraText('Los datos de titulares proceden de GoPlus. Los precios y volúmenes DEX, si están disponibles, se muestran en una sección independiente. Ninguna fuente demuestra que la liquidez esté bloqueada.')));
 if(holders.length){
  report.append(element('h4','section-title',nvraText('Principales titulares (datos del proveedor)')));
  const wrap=element('div','table-wrap'),table=element('table','holders-table'),thead=element('thead'),tr=element('tr');
  [nvraText('Dirección'),nvraText('Participación'),nvraText('Contrato')].forEach(t=>tr.append(element('th','',t)));thead.append(tr);table.append(thead);
  const tbody=element('tbody');
  holders.slice(0,10).forEach(h=>{
   if(!h||typeof h!=='object')return;
   const row=element('tr'),address=typeof h.address==='string'?h.address:'';
   row.append(element('td','',address&&/^0x[a-fA-F0-9]{40}$/.test(address)?address.slice(0,8)+'…'+address.slice(-6):nvraText('Sin datos')));
   const pct=percentage(h.percent);
   row.append(element('td','',pct===null?nvraText('Sin datos'):pct.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:3})+' %'));
   row.append(element('td','',h.is_contract==='1'?nvraText('Sí'):h.is_contract==='0'?nvraText('No'):nvraText('Sin datos')));
   tbody.append(row);
  });
  table.append(tbody);wrap.append(table);report.append(wrap);
  report.append(element('p','small muted',nvraText('Las direcciones de contratos y pools pueden concentrar grandes porcentajes sin representar a una sola persona. No es una medición de propietarios únicos.')));
 }
}
function usd(value,digits=2){
 const n=safeNumber(value);
 return n===null?nvraText('Sin datos'):new Intl.NumberFormat('es-ES',{style:'currency',currency:'USD',maximumFractionDigits:digits}).format(n);
}
function appendMarket(pairs,address,network){
 report.append(element('h4','section-title',nvraText('Mercados DEX · DexScreener')));
 const selected=pairs.filter(p=>p&&typeof p==='object'&&!Array.isArray(p)&&p.chainId===dexChains[network]&&
   [p.baseToken?.address,p.quoteToken?.address].some(a=>typeof a==='string'&&a.toLowerCase()===address.toLowerCase()));
 if(!selected.length){report.append(element('p','muted',nvraText('No se encontraron pares DEX para este contrato en la red seleccionada. No significa que no se negocie en otros mercados.')));return;}
 selected.sort((a,b)=>(safeNumber(b.liquidity?.usd)||0)-(safeNumber(a.liquidity?.usd)||0));
 const top=selected[0];
 const basePairs=selected.filter(p=>typeof p.baseToken?.address==='string'&&p.baseToken.address.toLowerCase()===address.toLowerCase());
 const pricePair=basePairs[0];
 const summary=element('div','market-card');
 summary.append(element('p','small muted',nvraText('Par con mayor liquidez USD reportada entre los ')+selected.length+nvraText(' pares devueltos. Los datos son aproximados, no agregados de todo el mercado.')));
 const grid=element('div','market-grid');
 grid.append(metricCard(nvraText('Precio USD (token consultado)'),pricePair?usd(pricePair.priceUsd,8):nvraText('Sin datos'),nvraText('Precio del par con más liquidez donde el token consultado es activo base; puede diferir del par principal.')));
 grid.append(metricCard(nvraText('Liquidez del par'),usd(top.liquidity?.usd),nvraText('Liquidez estimada por DexScreener; no equivale a fondos bloqueados.')));
 grid.append(metricCard(nvraText('Volumen 24 h del par'),usd(top.volume?.h24),nvraText('Volumen de operaciones del par; no es volumen global.')));
 const priceChange=pricePair?.priceChange?.h24;
 const priceChangeNumber=priceChange===null||priceChange===undefined||priceChange===''?NaN:Number(priceChange);
 grid.append(metricCard(nvraText('Variación 24 h del token'),Number.isFinite(priceChangeNumber)?priceChangeNumber.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:2})+' %':nvraText('Sin datos'),nvraText('Variación del activo base del mismo par utilizado para mostrar el precio.')));
 summary.append(grid);report.append(summary);
 report.append(element('h4','section-title',nvraText('Pares DEX destacados')));
 for(const pair of selected.slice(0,5)){
  const block=element('div','market-pair');
  const title=element('strong','',(pair.baseToken?.symbol||'?')+' / '+(pair.quoteToken?.symbol||'?')+' · '+String(pair.dexId||'DEX'));
  block.append(title);
  block.append(element('small','',nvraText('Liquidez: ')+usd(pair.liquidity?.usd)+nvraText(' · Volumen 24 h: ')+usd(pair.volume?.h24)));
  if(typeof pair.url==='string'&&/^https:\/\/dexscreener\.com\//.test(pair.url)){
   const link=element('a','',nvraText('Ver par en DexScreener'));link.href=pair.url;link.target='_blank';link.rel='noopener noreferrer';block.append(link);
  }
  report.append(block);
 }
 report.append(element('p','notice',nvraText('Datos DEX de terceros, sujetos a retrasos y cobertura incompleta. La liquidez y el volumen pueden cambiar rápidamente. No se suman los pares para evitar conclusiones engañosas.')));
}
function historicalPoints(payload){
 const raw=payload?.data?.attributes?.ohlcv_list;
 if(!Array.isArray(raw))return [];
 const unique=new Map();
 for(const row of raw){
  if(!Array.isArray(row)||row.length<6)continue;
  const time=Number(row[0]),close=safeNumber(row[4]),volume=safeNumber(row[5]);
  if(close===0)continue;
  if(!Number.isFinite(time)||time<=0||close===null)continue;
  unique.set(time,{time,close,volume});
 }
 return [...unique.values()].sort((a,b)=>a.time-b.time);
}
function interpretHistory(points){
 if(!Array.isArray(points)||points.length<3)return null;
 if(points.some(p=>!Number.isFinite(p.close)||p.close<=0))return null;
 const first=points[0].close,last=points[points.length-1].close;
 if(!Number.isFinite(first)||first<=0||!Number.isFinite(last))return null;
 const change=(last/first-1)*100;
 const returns=[];
 for(let i=1;i<points.length;i++)if(points[i-1].close>0&&points[i].close>=0)returns.push((points[i].close/points[i-1].close-1)*100);
 const mean=returns.reduce((a,b)=>a+b,0)/returns.length;
 const volatility=Math.sqrt(returns.reduce((a,b)=>a+(b-mean)**2,0)/returns.length);
 const validVolumes=points.filter(p=>p.volume!==null);
 const half=Math.floor(validVolumes.length/2);
 let volumeChange=null;
 if(half>=2){
  const earlier=validVolumes.slice(0,half).reduce((a,p)=>a+p.volume,0)/half;
  const later=validVolumes.slice(-half).reduce((a,p)=>a+p.volume,0)/half;
  if(earlier>0)volumeChange=(later/earlier-1)*100;
 }
 return {change,volatility,volumeChange,observations:points.length};
}
function simpleMovingAverage(points,period){
 if(!Array.isArray(points)||points.length<period||period<1)return null;
 const window=points.slice(-period).map(p=>p.close);
 if(window.some(v=>!Number.isFinite(v)))return null;
 return window.reduce((a,b)=>a+b,0)/period;
}
function relativeStrengthIndex(points,period=14){
 if(!Array.isArray(points)||points.length<period+1)return null;
 const closes=points.slice(-(period+1)).map(p=>p.close);
 if(closes.some(v=>!Number.isFinite(v)||v<0))return null;
 let gains=0,losses=0;
 for(let i=1;i<closes.length;i++){const delta=closes[i]-closes[i-1];if(delta>0)gains+=delta;else losses-=delta;}
 if(losses===0)return gains===0?50:100;
 if(gains===0)return 0;
 const rs=gains/losses;
 return 100-100/(1+rs);
}
function appendTechnicalIndicators(points,container){
 const panel=element('div','history-insights');
 panel.append(element('h5','',nvraText('Indicadores técnicos educativos')));
 const sma7=simpleMovingAverage(points,7),sma14=simpleMovingAverage(points,14),rsi=relativeStrengthIndex(points,14);
 panel.append(element('p','',sma7===null?nvraText('Media móvil simple (7 intervalos): se requieren al menos 7 cierres.'):nvraText('Media móvil simple (7 intervalos): ')+usd(sma7,8)+'.'));
 panel.append(element('p','',sma14===null?nvraText('Media móvil simple (14 intervalos): se requieren al menos 14 cierres.'):nvraText('Media móvil simple (14 intervalos): ')+usd(sma14,8)+'.'));
 if(rsi===null)panel.append(element('p','muted','RSI (14): se requieren al menos 15 cierres consecutivos.'));
 else{
  const context=rsi>70?nvraText('zona históricamente denominada sobrecompra'):rsi<30?nvraText('zona históricamente denominada sobreventa'):nvraText('zona intermedia');
  panel.append(element('p','','RSI (14): '+rsi.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:1})+' / 100, '+context+nvraText('. No implica un cambio de tendencia próximo.')));
 }
 panel.append(element('p','small muted',nvraText('Las medias son promedios de cierres; RSI calculado con ganancias y pérdidas simples de los últimos 14 cambios (no suavizado de Wilder). Cada intervalo equivale a una hora en 24 h y a un día en los demás periodos. Son indicadores descriptivos, no recomendaciones de inversión.')));
 container.append(panel);
}
function advancedHistorySignals(points){
 if(!Array.isArray(points)||points.length<3)return null;
 const closes=points.map(p=>p.close);
 if(closes.some(v=>!Number.isFinite(v)||v<=0))return null;
 const first=closes[0],last=closes[closes.length-1];
 const high=Math.max(...closes),low=Math.min(...closes);
 const maxDrawdown=closes.reduce((state,price)=>{
  state.peak=Math.max(state.peak,price);
  state.worst=Math.max(state.worst,(state.peak-price)/state.peak*100);
  return state;
 },{peak:first,worst:0}).worst;
 const sma7=simpleMovingAverage(points,7),sma14=simpleMovingAverage(points,14),rsi=relativeStrengthIndex(points,14);
 const volume=points.map(p=>p.volume).filter(v=>Number.isFinite(v)&&v>=0);
 return {first,last,high,low,maxDrawdown,sma7,sma14,rsi,volumeCoverage:volume.length/points.length*100,observations:points.length};
}
function dynamicHistoryNarrative(points){
 const data=advancedHistorySignals(points),base=interpretHistory(points);
 if(!data||!base)return null;
 const priceChange=(data.last/data.first-1)*100;
 const trend=priceChange>2?'up':priceChange< -2?'down':'sideways';
 const volume=base.volumeChange===null?'missing':base.volumeChange>20?'rising':base.volumeChange< -20?'falling':'stable';
 const momentum=data.rsi===null?'missing':data.rsi>70?'high':data.rsi<30?'low':'neutral';
 const averages=data.sma7===null||data.sma14===null?'missing':data.sma7>data.sma14*1.001?'bullish':data.sma7<data.sma14*.999?'bearish':'flat';
 const drawdown=data.maxDrawdown>=20?'deep':data.maxDrawdown>=5?'moderate':'limited';
 const quality=data.volumeCoverage<80?'partial':'sufficient';
 let confluence='mixed';
 if(trend==='up'&&averages==='bullish'&&momentum!=='low')confluence='aligned-up';
 else if(trend==='down'&&averages==='bearish'&&momentum!=='high')confluence='aligned-down';
 else if(trend==='sideways')confluence='range';
 const divergence=trend==='up'&&volume==='falling'?'price-up-volume-down':trend==='down'&&volume==='rising'?'price-down-volume-up':'none';
 return {trend,volume,momentum,averages,drawdown,quality,confluence,divergence,priceChange,volumeChange:base.volumeChange,volatility:base.volatility};
}
function appendDynamicHistoryNarrative(points,container){
 const signals=dynamicHistoryNarrative(points);
 if(!signals)return;
 const panel=element('div','history-insights');
 panel.append(element('h5','',nvraText('Diagnóstico variable según los datos')));
 const statements={
 'aligned-up':'El precio sube y la SMA rápida supera a la lenta: ambas medidas apuntan en la misma dirección, aunque no prueban que la subida continúe.',
 'aligned-down':'El precio cae y la SMA rápida está bajo la lenta: coinciden dos señales retrospectivas de debilidad, no una predicción.',
 'range':'El cambio neto es reducido: conviene observar el rango y los retrocesos, porque una aparente estabilidad puede ocultar oscilaciones amplias.',
 'mixed':'Las señales de precio, medias e impulso no coinciden claramente. Es preferible describir un escenario mixto que forzar una tendencia.',
 'price-up-volume-down':'El precio avanza mientras el volumen medio reciente cae: la participación de este pool no acompaña el movimiento con la misma intensidad. No demuestra agotamiento.',
 'price-down-volume-up':'El precio retrocede mientras el volumen medio reciente aumenta: hay más actividad en este pool, pero no podemos distinguir compras de ventas con estos datos.',
 'high':'El RSI está por encima de 70: el impulso alcista reciente domina el cálculo. Puede mantenerse elevado y no es una orden de venta.',
 'low':'El RSI está por debajo de 30: predominan las caídas recientes en el cálculo. No implica que exista un suelo.',
 'neutral':'El RSI está entre 30 y 70: no presenta una lectura extrema, pero eso no significa ausencia de riesgo.',
 'missing':'Faltan observaciones para calcular algunos indicadores; no se deben interpretar como señales neutrales.',
 'deep':'Se observó un retroceso de al menos el 20 % desde un máximo de cierre: la trayectoria tuvo caídas importantes, aunque después pudiera recuperarse.',
 'moderate':'Se observó un retroceso de entre el 5 % y el 20 % desde un máximo de cierre. Evalúa su magnitud junto con la variabilidad entre intervalos.',
 'limited':'El mayor retroceso observado entre cierres es inferior al 5 %. Este dato no excluye movimientos bruscos dentro de cada intervalo.',
 'partial':'Falta volumen válido en más del 20 % de los intervalos: las conclusiones sobre actividad tienen menor respaldo.',
 'sufficient':'La cobertura de volumen es de al menos el 80 %: permite comparar intervalos, pero sigue representando solo este pool.',
 'rising':'El volumen medio de la segunda mitad supera al de la primera en más del 20 %; hay mayor actividad registrada, sin que esto indique su dirección.',
 'falling':'El volumen medio de la segunda mitad es al menos un 20 % menor; la actividad registrada se redujo, sin explicar por qué.',
 'stable':'El volumen medio cambió menos del 20 % entre mitades: no se detecta una diferencia marcada con este criterio descriptivo.'
 };
 const add=(title,key)=>{panel.append(element('h6','',nvraText(title)));panel.append(element('p','',nvraText(statements[key])));};
 add('Lectura conjunta de tendencia y medias',signals.confluence);
 if(signals.divergence!=='none')add('Relación entre precio y volumen',signals.divergence);
 else add('Evolución de la actividad',signals.volume);
 add('Impulso reciente',signals.momentum);
 add('Magnitud de las caídas',signals.drawdown);
 add('Fiabilidad de la muestra',signals.quality);
 panel.append(element('p','small muted',nvraText('Criterios descriptivos de este informe: tendencia ±2 %; cambio de volumen ±20 %; SMA separadas por 0,1 %; RSI 30/70; retroceso 5/20 % y cobertura 80 %. Son umbrales orientativos, no niveles universales ni recomendaciones de inversión.')));
 container.append(panel);
}
function supportResistanceLevels(points){
 if(!Array.isArray(points)||points.length<7)return null;
 const closes=points.map(p=>p.close);
 if(closes.some(v=>!Number.isFinite(v)||v<=0))return null;
 const last=closes.at(-1),prior=closes.slice(0,-1);
 const pivots=[];
 for(let i=2;i<closes.length-2;i++){
  const window=closes.slice(i-2,i+3);
  if(closes[i]===Math.min(...window)&&window.filter(v=>v===closes[i]).length===1)pivots.push({type:'support',price:closes[i]});
  if(closes[i]===Math.max(...window)&&window.filter(v=>v===closes[i]).length===1)pivots.push({type:'resistance',price:closes[i]});
 }
 const tolerance=.015;
 const group=(type)=>{const levels=[];
  for(const pivot of pivots.filter(p=>p.type===type)){
   const match=levels.find(l=>Math.abs(l.price-pivot.price)/l.price<=tolerance);
   if(match){match.price=(match.price*match.touches+pivot.price)/(match.touches+1);match.touches++;}
   else levels.push({price:pivot.price,touches:1});
  }
  return levels;
 };
 const supports=group('support'),resistances=group('resistance');
 const choose=(levels,below)=>levels.filter(l=>below?l.price<=last:l.price>=last).sort((a,b)=>Math.abs(a.price-last)-Math.abs(b.price-last)||b.touches-a.touches)[0]||null;
 const support=choose(supports,true),resistance=choose(resistances,false);
 const previousHigh=Math.max(...prior),previousLow=Math.min(...prior);
 const breakout=last>previousHigh?'up':last<previousLow?'down':'none';
 return {support,resistance,last,breakout,previousHigh,previousLow,observations:closes.length,tolerance};
}
function appendSupportResistanceInterpretation(points,container){
 const levels=supportResistanceLevels(points);
 const panel=element('div','history-insights');
 panel.append(element('h5','',nvraText('Soportes, resistencias y posibles rupturas')));
 if(!levels){
  panel.append(element('p','muted',nvraText('Se requieren al menos 7 cierres válidos para buscar zonas de soporte y resistencia.')));
  container.append(panel);return;
 }
 const fmt=v=>v.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:2});
 if(levels.support){
  const distance=(levels.last/levels.support.price-1)*100;
  panel.append(element('p','',nvraText('Soporte observado cercano: ')+usd(levels.support.price,8)+nvraText(' (')+levels.support.touches+nvraText(' mínimos locales agrupados; precio actual a ')+fmt(distance)+nvraText(' % por encima). Es una zona histórica, no un suelo garantizado.')));
 }else panel.append(element('p','muted',nvraText('No se detectó un mínimo local anterior suficientemente cercano por debajo del último cierre; no se inventa un soporte.')));
 if(levels.resistance){
  const distance=(levels.resistance.price/levels.last-1)*100;
  panel.append(element('p','',nvraText('Resistencia observada cercana: ')+usd(levels.resistance.price,8)+nvraText(' (')+levels.resistance.touches+nvraText(' máximos locales agrupados; a ')+fmt(distance)+nvraText(' % por encima del precio actual). Es una zona histórica, no un techo garantizado.')));
 }else panel.append(element('p','muted',nvraText('No se detectó un máximo local anterior por encima del último cierre; no se inventa una resistencia.')));
 const commentary=levels.breakout==='up'
  ?'El último cierre supera todos los cierres anteriores de esta muestra: posible ruptura alcista observada, todavía sin confirmación posterior. Comprueba volumen, liquidez y nuevos cierres.'
  :levels.breakout==='down'
  ?'El último cierre cae por debajo de todos los cierres anteriores de esta muestra: posible ruptura bajista observada, todavía sin confirmación posterior. Comprueba volumen, liquidez y nuevos cierres.'
  :levels.support&&levels.resistance
  ?'El último cierre permanece entre las zonas identificadas. Un acercamiento a una zona no equivale a una ruptura; observa cierres posteriores y actividad.'
  :'La muestra no permite delimitar ambos lados de un rango. No se puede afirmar que el precio esté consolidando o rompiendo una zona.';
 panel.append(element('p','',nvraText(commentary)));
 panel.append(element('p','small muted',nvraText('Método reproducible: pivotes de cierre con dos intervalos a cada lado, agrupados si difieren como máximo un 1,5 %. Se muestra el nivel más próximo al último cierre en cada dirección. Una ruptura compara el último cierre con los anteriores de la muestra, no con el mercado completo. Los toques no son pruebas independientes ni garantías.')));
 container.append(panel);
}
function appendAdvancedHistoryInterpretation(points,container){
 const data=advancedHistorySignals(points);
 if(!data)return;
 const panel=element('div','history-insights');
 panel.append(element('h5','',nvraText('Análisis ampliado: cómo interpretar el gráfico')));
 const add=(title,body)=>{panel.append(element('h6','',nvraText(title)));panel.append(element('p','',body));};
 const fmt=v=>v.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:2});
 const range=(data.high/data.low-1)*100;
 add('1. Rango y retrocesos',nvraText('Entre los cierres disponibles, el mínimo fue ')+usd(data.low,8)+nvraText(' y el máximo ')+usd(data.high,8)+nvraText('. La distancia entre ambos equivale al ')+fmt(range)+nvraText(' %. El mayor retroceso desde un máximo de cierre anterior fue del ')+fmt(data.maxDrawdown)+nvraText(' %. Un retroceso mide una caída observada, no la pérdida máxima futura.'));
 if(data.sma7!==null&&data.sma14!==null){
  const relative=(data.sma7/data.sma14-1)*100;
  const relation=Math.abs(relative)<0.1?nvraText('muy próxima a'):relative>0?nvraText('por encima de'):nvraText('por debajo de');
  const priceRelation=data.last>data.sma7&&data.last>data.sma14?nvraText('El último cierre está por encima de ambas medias.'):data.last<data.sma7&&data.last<data.sma14?nvraText('El último cierre está por debajo de ambas medias.'):nvraText('El último cierre está entre las dos medias o coincide con alguna.');
  add('2. Tendencia frente a medias móviles',nvraText('La SMA 7 está ')+relation+nvraText(' la SMA 14 (diferencia relativa: ')+(relative>0?'+':'')+fmt(relative)+nvraText(' %). ')+priceRelation+nvraText(' Las medias resumen cierres pasados y reaccionan con retraso; un cruce aislado no confirma una tendencia.'));
 }else add('2. Tendencia frente a medias móviles',nvraText('Se necesitan al menos 14 cierres para comparar SMA 7 y SMA 14. No es adecuado concluir que existe un cruce sin esos datos.'));
 if(data.rsi!==null){
  const zone=data.rsi>70?nvraText('zona alta (>70)'):data.rsi<30?nvraText('zona baja (<30)'):nvraText('zona intermedia (30–70)');
  add('3. Impulso y RSI',nvraText('El RSI simple de 14 cambios marca ')+fmt(data.rsi)+nvraText('/100: ')+zone+nvraText('. Mide el equilibrio reciente entre subidas y bajadas; no indica por sí solo que el precio vaya a girar. Puede permanecer extremo durante tendencias fuertes.'));
 }else add('3. Impulso y RSI',nvraText('Se necesitan 15 cierres para calcular el RSI de 14 cambios. No debe sustituirse la ausencia de datos por una señal neutral.'));
 add('4. Calidad de los datos y confirmación',nvraText('Cobertura de volumen válido: ')+fmt(data.volumeCoverage)+nvraText(' % de los ')+data.observations+nvraText(' intervalos. Contrasta dirección del precio, actividad negociada y liquidez antes de interpretar un movimiento. El volumen pertenece a este pool, no a todo el mercado.'));
 panel.append(element('p','small muted',nvraText('Lectura profesional: las SMA 7/14 y el RSI se calculan con cierres por intervalo; el RSI usa variaciones simples, no el suavizado de Wilder. El rango y el retroceso se basan en cierres, no en máximos y mínimos intraperiodo. La volatilidad anterior es descriptiva y no anualizada. Estos indicadores no miden riesgo de contrato, profundidad de órdenes ni deslizamiento y no constituyen señales operativas.')));
 container.append(panel);
}
function appendHistoryInterpretation(points,container){
 const insight=interpretHistory(points);
 if(!insight){container.append(element('p','muted',nvraText('No hay suficientes datos para interpretar la evolución.')));return;}
 const panel=element('div','history-insights');
 panel.append(element('h5','',nvraText('Lectura educativa del periodo')));
 const trend=Math.abs(insight.change)<.5?nvraText('prácticamente estable'):insight.change>0?nvraText('ascendente'):nvraText('descendente');
 panel.append(element('p','','Tendencia observada: '+trend+' ('+(insight.change>0?'+':'')+insight.change.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:2})+nvraText(' % entre el primer y último cierre).')));
 panel.append(element('p','',nvraText('Variabilidad de los cambios entre intervalos: ')+insight.volatility.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:2})+nvraText(' puntos porcentuales (desviación típica descriptiva, no anualizada).')));
 if(insight.volumeChange!==null)panel.append(element('p','',nvraText('Volumen medio de la segunda mitad frente a la primera: ')+(insight.volumeChange>0?'+':'')+insight.volumeChange.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:1})+nvraText(' %. Esto no demuestra por sí solo presión compradora o vendedora.')));
 else panel.append(element('p','muted',nvraText('No hay suficientes volúmenes comparables para evaluar su evolución.')));
 panel.append(element('p','small muted',nvraText('Interpretación automática basada únicamente en ')+insight.observations+nvraText(' observaciones del pool seleccionado. No es una predicción, señal de compra o venta ni evaluación de seguridad.')));
 container.append(panel);
}
function drawHistoricalChart(points,container,metric,showAverages=false){
 const width=640,height=245,left=75,right=20,top=20,bottom=43;
 const averages=showAverages&&metric==='close'?[7,14].map(period=>({period,values:points.map((_,i)=>i+1>=period?simpleMovingAverage(points.slice(0,i+1),period):null)})):[];
 const values=points.map(p=>p[metric]).concat(...averages.map(a=>a.values.filter(v=>v!==null))),lo=Math.min(...values),hi=Math.max(...values);
 const span=hi-lo||Math.max(hi*.02,0.00000001);
 const min=metric==='volume'?0:Math.max(0,lo-span*.1),max=hi+span*.1;
 const x=i=>left+i*(width-left-right)/Math.max(1,points.length-1);
 const y=v=>top+(max-v)/(max-min)*(height-top-bottom);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 '+width+' '+height);svg.setAttribute('class','history-chart');
 svg.setAttribute('role','img');svg.setAttribute('aria-label',metric==='volume'?nvraText('Histórico de volumen del pool en USD'):nvraText('Histórico del precio de cierre del activo base en USD'));
 function svgEl(tag,attrs,content){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(content!==undefined)n.textContent=content;svg.append(n);return n;}
 for(let i=0;i<3;i++){const v=min+(max-min)*i/2;const yy=y(v);svgEl('line',{x1:left,y1:yy,x2:width-right,y2:yy,class:'axis'});svgEl('text',{x:5,y:yy+4},usd(v,metric==='volume'?0:6));}
 if(metric==='volume'){
  const barWidth=Math.max(2,(width-left-right)/points.length*.72);
  points.forEach((p,i)=>svgEl('rect',{x:x(i)-barWidth/2,y:y(p.volume),width:barWidth,height:Math.max(1,height-bottom-y(p.volume)),fill:'#6ce9bb'}));
 }else{
  svgEl('path',{d:points.map((p,i)=>(i?'L':'M')+x(i).toFixed(2)+','+y(p.close).toFixed(2)).join(' '),class:'line'});
  for(const average of averages){
   const segments=average.values.map((v,i)=>v===null?null:{i,v}).filter(Boolean);
   if(segments.length<2)continue;
   svgEl('path',{d:segments.map((p,i)=>(i?'L':'M')+x(p.i).toFixed(2)+','+y(p.v).toFixed(2)).join(' '),fill:'none',stroke:average.period===7?'#ffd166':'#8ba7ff','stroke-width':2.4,'stroke-dasharray':average.period===14?'7 4':'none'});
  }
 }
 for(const i of [0,points.length-1])svgEl('text',{x:x(i),y:height-12,'text-anchor':i?'end':'start'},historyPeriod===1?new Date(points[i].time*1000).toLocaleTimeString(nvraText('es-ES'),{hour:'2-digit',minute:'2-digit'}):new Date(points[i].time*1000).toLocaleDateString(nvraText('es-ES'),{day:'2-digit',month:'short'}));
 container.append(svg);
}
async function appendHistoricalChart(pair,network,requestId){
 lastHistoricalPair=pair;lastHistoricalNetwork=network;lastHistoricalRequest=requestId;
 const previous=document.getElementById('historical-chart');
 if(previous)previous.remove();
 const box=element('div','market-card history-panel');box.id='historical-chart';
 box.append(element('h4','section-title',nvraText('Histórico DEX · GeckoTerminal')));
 report.append(box);
 const controls=element('div','history-controls');
 const periodLabel=element('label','',nvraText('Periodo'));
 const periodSelect=element('select');periodSelect.setAttribute('aria-label',nvraText('Periodo del gráfico'));
 for(const days of [1,7,30,90]){const opt=element('option','',days===1?nvraText('24 horas'):days+nvraText(' días'));opt.value=String(days);periodSelect.append(opt);}
 periodSelect.value=String(historyPeriod);
 periodSelect.addEventListener('change',()=>{historyPeriod=Number(periodSelect.value);if(requestId===activeRequest)appendHistoricalChart(pair,network,requestId);});
 const metricLabel=element('label','',nvraText('Mostrar'));
 const metricSelect=element('select');metricSelect.setAttribute('aria-label',nvraText('Métrica del gráfico'));
 for(const [value,label] of [['price',nvraText('Precio de cierre')],['volume',nvraText('Volumen por intervalo')],['both',nvraText('Comparar precio y volumen')]]){const opt=element('option','',label);opt.value=value;metricSelect.append(opt);}
 metricSelect.value=historyMetric;
 metricSelect.addEventListener('change',()=>{historyMetric=metricSelect.value;if(requestId===activeRequest)appendHistoricalChart(pair,network,requestId);});
 periodLabel.append(periodSelect);metricLabel.append(metricSelect);controls.append(periodLabel,metricLabel);box.append(controls);
 if(!pair||!/^0x[a-fA-F0-9]{40}$/.test(String(pair.pairAddress||''))){box.append(element('p','muted',nvraText('No hay un pool EVM compatible para consultar datos históricos.')));return;}
 box.append(element('p','small muted',nvraText('Fuente: GeckoTerminal. El precio corresponde al activo base del pool (')+String(pair.baseToken?.symbol||nvraText('sin símbolo'))+nvraText('); el volumen corresponde al pool completo. No son datos agregados de todo el mercado.')));
 if(historyController)historyController.abort();
 const controller=new AbortController();historyController=controller;
 const timeout=setTimeout(()=>controller.abort(),10000);
 try{
  const interval=historyPeriod===1?'hour':'day';
  const limit=historyPeriod===1?24:historyPeriod;
  const url='https://api.geckoterminal.com/api/v2/networks/'+geckoChains[network]+'/pools/'+encodeURIComponent(pair.pairAddress)+'/ohlcv/'+interval+'?aggregate=1&limit='+limit+'&currency=usd';
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
  if(!response.ok)throw Error(nvraText('Histórico no disponible'));
  const points=historicalPoints(await response.json());
  if(requestId!==activeRequest||historyController!==controller)return;
  const available=points;
  const volumePoints=points.filter(p=>p.volume!==null);
  if(available.length<2){box.append(element('p','muted',historyMetric==='volume'||historyMetric==='both'?nvraText('La fuente no proporciona suficientes precios y volúmenes históricos para este pool.'):nvraText('No hay suficientes precios históricos para mostrar el gráfico.')));return;}
  const first=available[0].close,last=available[available.length-1].close;
  const change=first>0?(last-first)/first*100:null;
  const stats=element('div','history-summary');
  stats.append(metricCard(nvraText('Variación del precio en el periodo'),change===null?nvraText('Sin datos'):(change>0?'+':'')+change.toLocaleString(nvraText('es-ES'),{maximumFractionDigits:2})+' %',nvraText('Comparación entre el primer y último cierre disponible.')));
  const totalVolume=available.reduce((sum,p)=>sum+(p.volume===null?0:p.volume),0);
  stats.append(metricCard(nvraText('Volumen acumulado del pool'),available.every(p=>p.volume!==null)?usd(totalVolume,0):nvraText('Incompleto'),nvraText('Suma de los intervalos disponibles; no es volumen global.')));
  box.append(stats);
  appendHistoryInterpretation(available,box);
 appendAdvancedHistoryInterpretation(available,box);
  appendDynamicHistoryNarrative(available,box);
  appendSupportResistanceInterpretation(available,box);
  appendTechnicalIndicators(available,box);
  const plots=element('div','history-comparison');
  if(historyMetric==='both'){
   const pricePlot=element('div');pricePlot.append(element('h5','',nvraText('Precio de cierre · USD')));drawHistoricalChart(available,pricePlot,'close',true);plots.append(pricePlot);
   const volumePlot=element('div');volumePlot.append(element('h5','',nvraText('Volumen del pool · USD')));if(volumePoints.length>=2)drawHistoricalChart(volumePoints,volumePlot,'volume');else volumePlot.append(element('p','muted',nvraText('No hay suficientes volúmenes comparables para evaluar su evolución.')));plots.append(volumePlot);
  }else if(historyMetric==='volume'){if(volumePoints.length>=2)drawHistoricalChart(volumePoints,plots,'volume');else plots.append(element('p','muted',nvraText('No hay suficientes volúmenes comparables para evaluar su evolución.')));}else drawHistoricalChart(available,plots,'close',true);
  box.append(plots);
  if(historyMetric!=='volume')box.append(element('p','small muted',nvraText('Líneas del gráfico: precio (verde), media móvil SMA 7 (amarillo) y SMA 14 (azul discontinuo). Las medias solo aparecen cuando existen suficientes cierres.')));
  const inspector=element('div','history-inspector');
  const reading=element('p','small');reading.setAttribute('aria-live','polite');
  const slider=element('input');slider.type='range';slider.min='0';slider.max=String(available.length-1);slider.step='1';slider.value=String(available.length-1);
  slider.setAttribute('aria-label',nvraText('Seleccionar día del histórico'));
  const updateReading=()=>{
   const point=available[Number(slider.value)];
   reading.textContent=new Date(point.time*1000).toLocaleString(nvraText('es-ES'),historyPeriod===1?{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}:{day:'2-digit',month:'2-digit',year:'numeric'})+nvraText(' · Precio: ')+usd(point.close,8)+nvraText(' · Volumen: ')+usd(point.volume,0);
  };
  slider.addEventListener('input',updateReading);updateReading();
  inspector.append(element('strong','',historyPeriod===1?nvraText('Explorar valores horarios'):nvraText('Explorar valores diarios')),reading,slider);
  inspector.append(element('p','small muted',historyPeriod===1?nvraText('Desliza o utiliza las flechas del teclado para consultar cada hora.'):nvraText('Desliza o utiliza las flechas del teclado para consultar cada día.')));
  box.append(inspector);
  box.append(element('p','small muted',nvraText('Datos disponibles: ')+new Date(available[0].time*1000).toLocaleDateString(nvraText('es-ES'))+' a '+new Date(available[available.length-1].time*1000).toLocaleDateString(nvraText('es-ES'))+' · '+available.length+(historyPeriod===1?nvraText(' observaciones horarias.'):nvraText(' observaciones diarias.'))+nvraText(' Los datos históricos no predicen resultados futuros.')));
 }catch(e){if(requestId===activeRequest&&historyController===controller)box.append(element('p','muted',nvraText('Histórico no disponible temporalmente para este pool. El informe de seguridad sigue siendo independiente.')));}
 finally{clearTimeout(timeout);if(historyController===controller)historyController=null;}
}
async function appendMarketFromApi(address,network,requestId){
 const controller=new AbortController();
 marketController=controller;
 const timeout=setTimeout(()=>controller.abort(),10000);
 try{
  const url='https://api.dexscreener.com/token-pairs/v1/'+dexChains[network]+'/'+encodeURIComponent(address);
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const pairs=await response.json();
  if(requestId===activeRequest){if(!Array.isArray(pairs))throw new Error('Formato inesperado');appendMarket(pairs,address,network);const matching=pairs.filter(p=>p&&p.chainId===dexChains[network]&&[p.baseToken?.address,p.quoteToken?.address].some(a=>typeof a==='string'&&a.toLowerCase()===address.toLowerCase())).sort((a,b)=>(safeNumber(b.liquidity?.usd)||0)-(safeNumber(a.liquidity?.usd)||0));const compatible=matching.find(p=>typeof p.baseToken?.address==='string'&&p.baseToken.address.toLowerCase()===address.toLowerCase()&&typeof p.pairAddress==='string'&&/^0x[a-fA-F0-9]{40}$/.test(p.pairAddress));await appendHistoricalChart(compatible,network,requestId);}
 }catch(e){
  if(requestId===activeRequest){report.append(element('h4','section-title',nvraText('Mercados DEX · DexScreener')));report.append(element('p','muted',nvraText('Datos de mercado no disponibles en este momento. El análisis de seguridad anterior sigue siendo independiente.')));}
 }finally{clearTimeout(timeout);if(marketController===controller)marketController=null;}
}
function showMessage(title,message){report.replaceChildren();const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.className='muted';p.textContent=message;report.append(h,p);empty.classList.add('hidden');report.classList.remove('hidden');}
function invalidateReport(){
 activeRequest++;
 cancelPending();
 report.replaceChildren();
 report.classList.add('hidden');
 empty.classList.remove('hidden');
 analyzeButton.disabled=false;
 analyzeButton.textContent=nvraText('Analizar contrato real');
}
addrInput.addEventListener('input',invalidateReport);
netInput.addEventListener('change',invalidateReport);
analyzeButton.addEventListener('click',async()=>{
 const requestId=++activeRequest;
 cancelPending();
 const address=addrInput.value.trim();
 if(!/^0x[a-fA-F0-9]{40}$/.test(address)){
  showMessage(nvraText('Dirección no válida'),nvraText('Introduce una dirección pública EVM de 42 caracteres que empiece por 0x. No introduzcas claves privadas.'));return;
 }
 analyzeButton.disabled=true;analyzeButton.textContent=nvraText('Consultando datos reales…');
 showMessage(nvraText('Consultando GoPlus'),nvraText('Esperando respuesta del proveedor de indicadores de seguridad.'));
 const network=netInput.value;
 if(!endpointChains[network]||!dexChains[network]){showMessage(nvraText('Red no admitida'),nvraText('Selecciona una de las redes disponibles.'));analyzeButton.disabled=false;analyzeButton.textContent=nvraText('Analizar contrato real');return;}
 const controller=new AbortController();securityController=controller;const timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const chain=endpointChains[network];
  const url='https://api.gopluslabs.io/api/v1/token_security/'+chain+'?contract_addresses='+encodeURIComponent(address.toLowerCase());
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const data=await response.json();
  if(!data||typeof data!=='object')throw new Error(nvraText('Respuesta sin datos'));
  if(data.code!==1&&data.code!=='1')throw new Error(data.message||nvraText('Respuesta no válida'));
  const providerResults=data.result&&typeof data.result==='object'&&!Array.isArray(data.result)?data.result:{};
  const token=providerResults[address.toLowerCase()]||Object.entries(providerResults).find(([key])=>key.toLowerCase()===address.toLowerCase())?.[1];
  if(requestId!==activeRequest)return;
  if(!token||typeof token!=='object'||Array.isArray(token)||Object.keys(token).length===0){
   showMessage(nvraText('Sin datos de seguridad'),nvraText('GoPlus no devolvió indicadores para este contrato en la red seleccionada. Esto no significa que sea seguro. Consultando mercados DEX por separado…'));await appendMarketFromApi(address,network,requestId);return;
  }
  report.replaceChildren();
  report.append(element('h3','', nvraText('Indicadores reales · GoPlus')));
  report.append(element('p','small muted break-address','Red: '+network+nvraText(' · Dirección: ')+address+' · Consulta: '+new Date().toLocaleString(nvraText('es-ES'))+' · Fuente: GoPlus Security API'));
  let known=0,alerts=0,unavailable=0;
  const results=fields.map(field=>{
   const raw=token[field.key];
   const valid=raw==='0'||raw==='1'||raw===0||raw===1;
   if(!valid){unavailable++;return {field,state:'unknown'};}
   known++;
   if(String(raw)!==field.good){alerts++;return {field,state:'alert'};}
   return {field,state:'ok'};
  });
  const summary=element('div','summary'+(alerts?' alert':''));
  const title=alerts?nvraText('Atención: ')+alerts+nvraText(' indicador(es) para revisar'):known===0?nvraText('Información insuficiente'):nvraText('Sin alertas en los indicadores disponibles');
  summary.append(element('h4','',title));
  summary.append(element('p','small muted',known+nvraText(' de ')+fields.length+' indicadores disponibles · '+unavailable+nvraText(' sin datos. No se calcula una puntuación de seguridad.')));
  report.append(summary);
  const guide=element('nav','report-jump');
  guide.setAttribute('aria-label',nvraText('Secciones del informe'));
  for(const [target,label] of [['report-indicators','Indicadores de seguridad'],['report-holders','Titulares y suministro'],['report-markets','Mercados y gráficos']]){
   const link=element('a','report-jump-link',nvraText(label));
   link.href='#'+target;
   guide.append(link);
  }
  report.append(guide);
  const indicatorTitle=element('h4','section-title',nvraText('Indicadores del contrato'));
  indicatorTitle.id='report-indicators';
  report.append(indicatorTitle);
  for(const item of results){
   const {field,state}=item;
   const block=element('div','indicator');
   const head=element('div','indicator-head');
   const label=element('strong','',field.label);
   const status=element('span','status '+state,state==='ok'?nvraText('Sin alerta detectada'):state==='alert'?nvraText('Requiere revisión'):nvraText('Información no disponible'));
   head.append(label,status);block.append(head);
   const explanation=state==='ok'?field.positive:state==='alert'?field.negative:nvraText('GoPlus no facilitó un valor interpretable para este indicador. No se puede concluir que exista o no un riesgo.');
   block.append(element('p','muted',explanation));
   report.append(block);
  }
  report.append(element('p','notice',nvraText('Los resultados dependen de un proveedor externo y pueden ser incompletos o cambiar. “Sin alerta” no significa “seguro”. No es una auditoría ni asesoramiento financiero.')));
  const holdersTitle=element('h4','section-title',nvraText('Titulares y suministro'));
  holdersTitle.id='report-holders';
  report.append(holdersTitle);
  appendDashboard(token);
  const marketTitle=element('h4','section-title',nvraText('Mercados y gráficos'));
  marketTitle.id='report-markets';
  report.append(marketTitle);
  await appendMarketFromApi(address,network,requestId);
 }catch(e){
  if(requestId===activeRequest){showMessage(nvraText('Datos de seguridad no disponibles'),nvraText('No fue posible obtener información de GoPlus. Puede tratarse de un fallo temporal o de falta de cobertura. Esto no implica que el contrato sea seguro. Intentando consultar mercados DEX por separado…'));await appendMarketFromApi(address,network,requestId);}
 }finally{
  clearTimeout(timeout);
  if(securityController===controller)securityController=null;
  if(requestId===activeRequest){analyzeButton.disabled=false;analyzeButton.textContent=nvraText('Analizar contrato real');}
 }
});
