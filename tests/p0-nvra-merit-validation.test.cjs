const test=require('node:test');
const assert=require('node:assert/strict');
const {validateCandidate,eventKey}=require('../juego/nvra-merit-validation.cjs');
const allowed={mines:['mine_1'],treasures:['treasure_1'],castles:['castle_1']};
const base={event_type:'mine_capture',site_id:'mine_1',campaign_id:'campaign_1',revision:2};
test('only whitelisted map sites and known merit types are accepted',()=>{
 assert.equal(validateCandidate(base,allowed).ok,true);
 assert.equal(validateCandidate({...base,site_id:'imaginary_mine'},allowed).reason,'unknown_site');
 assert.equal(validateCandidate({...base,event_type:'token_transfer'},allowed).reason,'invalid_type');
 assert.equal(validateCandidate({...base,site_id:'<script>'},allowed).reason,'invalid_site');
 assert.equal(validateCandidate({...base,site_id:'treasure_1'},allowed).reason,'unknown_site');
});
test('rejects malformed or replay-prone campaign revisions',()=>{
 for(const revision of [0,-1,1.2,Number.MAX_SAFE_INTEGER+1,'2',null])assert.equal(validateCandidate({...base,revision},allowed).reason,'invalid_revision');
 for(const campaign_id of ['',null,'bad/id'])assert.equal(validateCandidate({...base,campaign_id},allowed).reason,'invalid_campaign');
 assert.equal(validateCandidate(null,allowed).reason,'invalid_event');
});
test('candidate key remains stable across retries and differs by player or location',()=>{
 const a=validateCandidate(base,allowed);
 assert.equal(eventKey('user_1',a),eventKey('user_1',a));
 assert.notEqual(eventKey('user_1',a),eventKey('user_2',a));
 assert.notEqual(eventKey('user_1',a),eventKey('user_1',validateCandidate({...base,site_id:'mine_2'}, {mines:['mine_1','mine_2']})));
 assert.equal(eventKey('user_1',{ok:false}),null);
});
