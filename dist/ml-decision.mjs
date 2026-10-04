/** Prototype interpretation policy shared by score, headline and explanation. */
const ids=['withdrawal','promise','pressure','group','access','education'];
export function educationalContext(text=''){
 const t=text.toLowerCase();
 const framing=/(investor education|educational (?:message|example)|scam (?:warning|awareness)|निवेशक शिक्षा|जागरूकता)/i.test(t);
 const caution=/(do not pay|don't pay|never pay|always (?:check|verify)|can be a scam|मत भेज|न दें|स्वतंत्र.*जाँच|धोखे से बच)/i.test(t);
 // Direct solicitations override an educational heading. Never use that heading as a whitelist.
 const direct=/(\b(?:we|our)\b.{0,45}\b(?:guarantee|promise|offer)\b|\b(?:send|deposit|invest)\b.{0,40}\b(?:now|today|immediately)\b|(?<!not )(?<!never )(?<!don't )\bpay\b.{0,35}\b(?:now|today|immediately)\b|हम.{0,40}(?:पक्का|गारंटी)|अभी.{0,30}(?:भेज|जमा|भुगतान))/i.test(t);
 return framing&&caution&&!direct;
}
export function modelScore(result){
 const empty=reason=>({value:null,reason,source:'multilingual-nli',calibrated:false});
 if(!result)return empty('pending');
 if(result.truncated)return empty('partial');
 const rows=result.rankings;
 if(!Array.isArray(rows)||rows.length!==6||new Set(rows.map(r=>r.id)).size!==6||!ids.every(id=>rows.some(r=>r.id===id))||rows.some(r=>!Number.isFinite(r.score)||r.score<0||r.score>1))return empty('invalid');
 if(educationalContext(result.analyzedText))return empty('education');
 const sorted=[...rows].sort((a,b)=>b.score-a.score),top=sorted[0];
 if(rows.find(r=>r.id==='education').score>=.65)return empty('education');
 if(top.id==='education')return empty('ambiguous');
 if(top.score<.75)return empty('uncertain');
 if(top.score-sorted[1].score<.10)return empty('ambiguous');
 return {value:Math.round(top.score*100),category:top.id,raw:top.score,reason:null,source:'multilingual-nli',model:result.model,revision:result.revision,createdAt:result.createdAt,calibrated:false};
}
