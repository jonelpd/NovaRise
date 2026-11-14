'use strict';
/** Adapter for a trusted backend Supabase client using service_role credentials.
 * Never instantiate in a browser or expose service_role secrets in GitHub Pages.
 * Initial campaign state MUST be established by an authoritative server flow.
 */
function createCampaignRepository(supabase){
 if(!supabase||typeof supabase.from!=='function'||typeof supabase.rpc!=='function')throw new TypeError('server Supabase client required');
 return {
  async load(userId,campaignId){
   const {data,error}=await supabase.from('nvr_authoritative_campaigns')
    .select('revision,status,hero_x,hero_y,nav_x,nav_y,moves,owned_mines')
    .eq('user_id',userId).eq('campaign_id',campaignId).maybeSingle();
   if(error)throw error;
   return data;
  },
  async compareAndSwap({userId,campaignId,expectedRevision,next}){
   // The SQL RPC checks site, distance, ownership, movement points and revision atomically.
   const siteId=next?.owned_mines?.at(-1);
   if(typeof siteId!=='string')return false;
   const {data,error}=await supabase.rpc('nvr_cas_authoritative_mine_capture',{
    p_user_id:userId,p_campaign_id:campaignId,p_expected_revision:expectedRevision,p_site_id:siteId
   });
   if(error)throw error;
   return data===true;
  }
 };
}
module.exports={createCampaignRepository};
