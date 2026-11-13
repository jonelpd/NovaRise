'use strict';
/** Pure validation for candidate merit events. NOT a server authorization or a token reward. */
const TYPES=Object.freeze({mine_capture:'mines',treasure_discovery:'treasures',castle_capture:'castles'});
const validId=x=>typeof x==='string'&&x.length>0&&x.length<=100&&/^[a-zA-Z0-9_-]+$/.test(x);
function validateCandidate(input,allowedSites){
 if(!input||typeof input!=='object'||Array.isArray(input))return {ok:false,reason:'invalid_event'};
 if(!Object.prototype.hasOwnProperty.call(TYPES,input.event_type))return {ok:false,reason:'invalid_type'};
 if(!validId(input.site_id))return {ok:false,reason:'invalid_site'};
 const sites=allowedSites?.[TYPES[input.event_type]];
 if(!Array.isArray(sites)||!sites.includes(input.site_id))return {ok:false,reason:'unknown_site'};
 if(!Number.isSafeInteger(input.revision)||input.revision<1)return {ok:false,reason:'invalid_revision'};
 if(!validId(input.campaign_id))return {ok:false,reason:'invalid_campaign'};
 return {ok:true,event_type:input.event_type,site_id:input.site_id,revision:input.revision,campaign_id:input.campaign_id};
}
function eventKey(userId,event){
 if(!validId(userId)||!event?.ok)return null;
 return JSON.stringify([userId,event.campaign_id,event.event_type,event.site_id]);
}
module.exports={validateCandidate,eventKey};
