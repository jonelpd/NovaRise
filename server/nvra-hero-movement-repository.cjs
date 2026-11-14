'use strict';
// Trusted backend only. Call after validateServerRoutePreflight and encounter checks.
// This adapter does not itself establish user identity or route legality.
function createHeroMovementRepository(supabase){
 if(!supabase||typeof supabase.rpc!=='function')throw new TypeError('server Supabase client required');
 return {
  async compareAndSwapMove({userId,campaignId,expectedRevision,from,to,cost}){
   if(typeof userId!=='string'||!userId||typeof campaignId!=='string'||!campaignId||
    !Number.isSafeInteger(expectedRevision)||expectedRevision<1||
    !from||!to||![from.x,from.y,to.x,to.y].every(n=>Number.isInteger(n)&&n>=1&&n<=78)||
    !Number.isSafeInteger(cost)||cost<1)return false;
   const {data,error}=await supabase.rpc('nvr_cas_authoritative_hero_move',{
    p_user_id:userId,p_campaign_id:campaignId,p_expected_revision:expectedRevision,
    p_from_x:from.x,p_from_y:from.y,p_to_x:to.x,p_to_y:to.y,p_cost:cost
   });
   if(error)throw error;
   return data===true;
  }
 };
}
module.exports={createHeroMovementRepository};
