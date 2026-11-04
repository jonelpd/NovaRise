(()=>{'use strict';
const root=document.getElementById('roadmap-public-ideas');
if(!root)return;
const filter=document.getElementById('community-stage-filter');
const count=document.getElementById('community-proposals-count');
const en=document.documentElement.lang==='en';
const labels=en?{consideracion:'Under consideration',planificada:'Planned',desarrollo:'In development',completada:'Completed'}:{consideracion:'En consideración',planificada:'Planificada',desarrollo:'En desarrollo',completada:'Completada'};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validStages=new Set(Object.keys(labels));
const explanations=en?{consideracion:'Being evaluated; not approved for development.',planificada:'Approved for planning; implementation has not started.',desarrollo:'Work is in progress; delivery is not yet complete.',completada:'Marked as completed by the project team.'}:{consideracion:'En evaluación; todavía no está aprobada para desarrollo.',planificada:'Aprobada para planificación; su ejecución no ha comenzado.',desarrollo:'Trabajo en curso; todavía no está terminada.',completada:'Marcada como completada por el equipo del proyecto.'};
const dateFormat=new Intl.DateTimeFormat(en?'en-GB':'es-ES',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'});
function publicationDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}/.test(value))return '';const date=new Date(value);return Number.isNaN(date.getTime())?'':dateFormat.format(date)}
let initiatives=[];
function render(){
 const stage=filter&&validStages.has(filter.value)?filter.value:'all';
 const visible=stage==='all'?initiatives:initiatives.filter(item=>item.stage===stage);
 if(count)count.textContent=en?(visible.length+' of '+initiatives.length+' published initiatives'):(visible.length+' de '+initiatives.length+' iniciativas publicadas');
 root.innerHTML=visible.length?visible.map(item=>'<article class="roadmap-card"><span class="roadmap-status study">'+escape(labels[item.stage]||item.stage)+'</span><h3>'+escape((en?item.title_en:item.title_es)||(en?item.title_es:item.title_en)||'')+'</h3><p>'+escape((en?item.description_en:item.description_es)||(en?item.description_es:item.description_en)||'')+'</p><p class="muted">'+escape(explanations[item.stage])+'</p>'+(publicationDate(item.created_at)?'<p class="muted"><small>'+(en?'Published initiative record: ':'Registro publicado: ')+escape(publicationDate(item.created_at))+'</small></p>':'')+'</article>').join(''):'<p class="muted">'+(initiatives.length?(en?'No initiatives match this stage.':'No hay iniciativas en este estado.'):(en?'No approved initiatives have been published yet.':'Todavía no se han publicado iniciativas aprobadas.'))+'</p>';
}
if(filter)filter.addEventListener('change',render);
fetch('https://spaafpqczvqahhwjxxrz.supabase.co/rest/v1/novarise_public_ideas?select=title_es,title_en,description_es,description_en,stage,created_at&published=eq.true&order=created_at.desc&limit=30',{headers:{apikey:'sb_publishable_U3x_STcgAUkwqmU23WZb1w_M8dBoFMz'}})
.then(async response=>{if(!response.ok)throw Error('fetch');return response.json()})
.then(rows=>{if(!Array.isArray(rows))throw Error('format');initiatives=rows.filter(row=>row&&validStages.has(row.stage));render()})
.catch(()=>{if(count)count.textContent='';root.textContent=en?'Initiatives are temporarily unavailable.':'Las iniciativas no están disponibles temporalmente.'});
})();
