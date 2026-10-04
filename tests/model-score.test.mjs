import {test} from 'node:test';import assert from 'node:assert/strict';import {modelScore} from '../dist/model-score.mjs';
const result=(scores={},extra={})=>({rankings:['withdrawal','promise','pressure','group','access','education'].map(id=>({id,score:scores[id]??.05})),model:'test-model',...extra});
test('score comes from actual model support, without rule weights',()=>{assert.equal(modelScore(result({withdrawal:.934})).value,93);assert.equal(modelScore(result({promise:.817})).value,82);assert.equal(modelScore(result({withdrawal:.3})).value,null);});
test('missing, malformed and out-of-range model results never fabricate scores',()=>{assert.equal(modelScore().value,null);assert.equal(modelScore({rankings:[]}).value,null);assert.equal(modelScore(result({withdrawal:NaN})).value,null);assert.equal(modelScore(result({withdrawal:1.1})).value,null);});
test('educational context, ambiguity and partial coverage abstain',()=>{assert.equal(modelScore(result({withdrawal:.95,education:.8})).reason,'education');assert.equal(modelScore(result({withdrawal:.95,promise:.92})).reason,'ambiguous');assert.equal(modelScore(result({withdrawal:.95},{truncated:true})).reason,'partial');});
test('duplicate or unknown labels are rejected',()=>{const r=result({withdrawal:.9});r.rankings[5]={id:'withdrawal',score:.2};assert.equal(modelScore(r).value,null);});

import {displayedScore} from '../dist/model-score.mjs';
test('model failure uses explicitly sourced rule score, including zero',()=>{
 assert.equal(displayedScore({status:'error'},{value:60}).value,60);
 assert.equal(displayedScore({status:'error'},{value:0}).value,0);
 assert.equal(displayedScore({status:'error'},{value:60}).source,'rules-fallback');
 for(const status of ['loading','cancelled','paused'])assert.equal(displayedScore({status},{value:60}).value,null);
});

test('educational example with weak model education score never becomes a profit promise',()=>{const r=result({promise:.49},{analyzedText:'Investor education: guaranteed returns can be a scam warning. Always verify the investment firm independently. Do not pay a fee to unlock withdrawals.'});assert.equal(modelScore(r).reason,'education');});
test('educational heading cannot hide a direct investment solicitation',()=>{const r=result({promise:.95},{analyzedText:'Investor education: always verify. We guarantee 30% returns. Invest now.'});assert.equal(modelScore(r).category,'promise');});
test('explanation and score share the same abstention decision',async()=>{const {suggestions}=await import('../dist/ml-classifier.mjs');for(const r of [result({promise:.49}),result({promise:.9,withdrawal:.89}),result({promise:.9,education:.8}),result({promise:.9})])assert.equal(suggestions(r).length,modelScore(r).value===null?0:1);});
