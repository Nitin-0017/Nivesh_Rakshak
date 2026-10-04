import {pipeline,env} from '@huggingface/transformers';
import {MODEL,REVISION,classifyText} from '../src/ml/classifier.mjs';
env.cacheDir='/private/tmp/nr-ml-cache';env.allowLocalModels=false;
const p=await pipeline('zero-shot-classification',MODEL,{revision:REVISION,dtype:'fp16'});
for(const [name,text] of [
 ['fee','Your earnings are ready. Complete the clearance payment today, otherwise your funds will remain on hold.'],
 ['hindi','आपका लाभ तैयार है। पैसे निकालने के लिए पहले सत्यापन शुल्क जमा करें।'],
 ['education','Investor education: never pay a fee to unlock withdrawals. Beware of guaranteed-return investment offers.'],
 ['group','Everyone in our investment tip group must buy XYZ shares at 10 AM together. We will push up the price and sell after new buyers join.']
]){const r=await classifyText(p,text);console.log(JSON.stringify({name,tokens:r.tokenCount,rankings:r.rankings.map(x=>({...x,score:Math.round(x.score*1000)/1000}))}));}
await p.dispose();
