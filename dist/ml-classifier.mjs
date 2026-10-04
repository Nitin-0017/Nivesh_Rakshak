import {modelScore} from './ml-decision.mjs';
export const MODEL='onnx-community/multilingual-MiniLMv2-L6-mnli-xnli-ONNX';
export const REVISION='ca5daf3d11b6c4b3143b1f4602a2edfb64c3ad7e';
export const CATEGORIES=[
 {id:'withdrawal',hypothesis:'paying a fee to withdraw money',en:'Payment before releasing funds',hi:'पैसे निकालने से पहले भुगतान',explain:'Asking you to pay before releasing your money can be a way to collect more money from you. Pause and confirm the fee through an independent official contact.',explainHi:'पैसे निकालने से पहले शुल्क माँगना आपसे और पैसे लेने का तरीका हो सकता है। भुगतान रोकें और स्वतंत्र आधिकारिक संपर्क से शुल्क की पुष्टि करें।'},
 {id:'promise',hypothesis:'guaranteed investment profits',en:'Guaranteed-profit promise',hi:'पक्के मुनाफे का वादा',explain:'Promises of guaranteed profit can lure you into sending money without understanding the risk. Verify who made the offer before paying.',explainHi:'पक्के मुनाफे का वादा पैसे भेजने के लिए लुभा सकता है। भुगतान से पहले प्रस्ताव देने वाले की स्वतंत्र पुष्टि करें।'},
 {id:'pressure',hypothesis:'urgent pressure to pay money',en:'Pressure to pay quickly',hi:'जल्दी भुगतान का दबाव',explain:'Check for deadlines or pressure to pay. Pause and independently verify the sender and offer.',explainHi:'जल्दी भुगतान के दबाव या समय सीमा को देखें। रुकें और भेजने वाले व प्रस्ताव की स्वतंत्र जाँच करें।'},
 {id:'group',hypothesis:'a group coordinating stock purchases',en:'Coordinated stock-tip promotion',hi:'समूह में एक साथ शेयर खरीदने का प्रचार',explain:'Check whether a tip group is pressuring members to buy together. This suggestion does not prove market manipulation.',explainHi:'देखें कि टिप समूह सदस्यों पर एक साथ खरीदने का दबाव तो नहीं डाल रहा। यह सुझाव बाजार में हेरफेर का प्रमाण नहीं है।'},
 {id:'access',hypothesis:'installing an app or sharing device access',en:'App or remote-access request',hi:'ऐप या रिमोट एक्सेस की माँग',explain:'Verify the app and the requester independently before granting access to your device.',explainHi:'डिवाइस का एक्सेस देने से पहले ऐप और माँग करने वाले की स्वतंत्र पुष्टि करें।'},
 {id:'education',hypothesis:'education about avoiding financial scams',en:'Possible educational warning',hi:'संभव शैक्षिक चेतावनी',explain:'The message may be discussing scam prevention. This does not establish that its sender or links are trustworthy.',explainHi:'संदेश धोखे से बचाव की जानकारी दे सकता है। इससे भेजने वाला या लिंक भरोसेमंद साबित नहीं होते।'}
];
export async function classifyText(classifier,text){
 const bounded=String(text).slice(0,6000);
 const encoded=await classifier.tokenizer(bounded,{truncation:false,add_special_tokens:false});
 const all=encoded.input_ids.tolist()[0].map(Number),used=all.slice(0,200);
 const analyzedText=classifier.tokenizer.decode(used,{skip_special_tokens:true});
 const result=await classifier(analyzedText,CATEGORIES.map(c=>c.hypothesis),{multi_label:true,hypothesis_template:'This message is about {}.'});
 const rankings=result.labels.map((label,i)=>({id:CATEGORIES.find(c=>c.hypothesis===label)?.id,score:result.scores[i]})).filter(x=>x.id&&Number.isFinite(x.score));
 return {model:MODEL,revision:REVISION,rankings,tokenCount:all.length,usedTokens:used.length,tokenIds:used.slice(0,16),analyzedText,truncated:all.length>200||text.length>6000,createdAt:new Date().toISOString()};
}
// Abstain when the strongest topics overlap; these are conservative prototype thresholds.
export function suggestions(result){const decision=modelScore(result);return decision.value===null?[]:[result.rankings.find(r=>r.id===decision.category)];}
