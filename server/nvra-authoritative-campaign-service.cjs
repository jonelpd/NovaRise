'use strict';
const {captureMine}=require('./nvra-authoritative-mines.cjs');
/**
 * Server-only orchestration. Adapter must use a transaction / CAS on (user_id,campaign_id,revision).
 * Do not pass a client-supplied state or expose this function as an RPC without authentication.
 * No NVRA transfers, point allocation, or reward event writes.
 */
async function applyMineCapture({userId,campaignId,action,repository}){
 if(typeof userId!=='string'||!userId||typeof campaignId!=='string'||!campaignId||!repository||typeof repository.load!=='function'||typeof repository.compareAndSwap!=='function')return {ok:false,reason:'invalid_request'};
 const previous=await repository.load(userId,campaignId);
 if(!previous)return {ok:false,reason:'campaign_not_found'};
 const result=captureMine(previous,action);
 if(!result.ok)return result;
 const updated=await repository.compareAndSwap({userId,campaignId,expectedRevision:previous.revision,next:result.next});
 if(!updated)return {ok:false,reason:'revision_conflict'};
 return {ok:true,revision:result.next.revision,site_id:result.event.site_id,points:0,verified:false};
}
module.exports={applyMineCapture};
