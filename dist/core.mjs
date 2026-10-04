/** Nivesh Rakshak deterministic engine. Inputs are data, never instructions. */
export const VERSION='nr-rules-1.0.0';
export const SOURCE_DATE='2026-10-03T18:30:00.000Z';
export const SOURCES={support:'https://investor.sebi.gov.in/Investor-support.html',registration:'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes',payment:'https://siportal.sebi.gov.in/intermediary/sebi-check',report:'https://www.cybercrime.gov.in/'};
export const FIXTURE={registration:'DEMO-REG-001',name:'Sampurna Example Investments',category:'Example investment intermediary',domain:'sampurna.example',handle:'@sampurna_example',contact:'help@sampurna.example',source:'Synthetic registry fixture v1. Not an official record.',date:SOURCE_DATE};
export const SAMPLE={
 identity:'I represent Sampurna Example Investments. Registration DEMO-REG-001. Join our investment service through @sampurna_fast. We guarantee 5% profit every week. No withdrawal fee.',
 portal:'Your Sampurna Example Investments investment dashboard is ready. Registration DEMO-REG-001. Open https://sampurna.example.fake-portal.example/dashboard to view your profits.',
 fee:'Your Sampurna Example Investments dashboard shows profits. Pay a verification fee now to unlock your withdrawal. Registration DEMO-REG-001.',
 benign:'Investor education: guaranteed returns can be a scam warning. Always check the registration and official website before investing. Do not pay a fee to unlock withdrawals.',
 offline:'I represent Sampurna Example Investments. Registration DEMO-REG-001. Please review our investment offer at https://sampurna.example.',
 hindi:'मैं Sampurna Example Investments का प्रतिनिधि हूँ। पंजीकरण DEMO-REG-001 है। हम हर हफ्ते 5% पक्का मुनाफा देते हैं। निकासी का कोई शुल्क नहीं है।',
 hindiFee:'आपका निवेश लाभ दिखा रहा है। निकासी खोलने के लिए अभी सत्यापन शुल्क जमा करें। Sampurna Example Investments, DEMO-REG-001।'
};
export function redact(input){
 let text=String(input).normalize('NFKC').trim().slice(0,10000),count=0;
 const sub=(re,repl)=>{text=text.replace(re,()=>{count++;return repl})};
 sub(/\b(?:otp|one[- ]time(?: password| code)?|password|passcode|pin|cvv|access[_ -]?token|api[_ -]?key)\s*(?:is|hai|है|[:=])?\s*[^\s,;]{3,80}/gi,'[secret removed]');
 sub(/(?:ओटीपी|पासवर्ड|पिन|सीवीवी)\s*(?:है|[:=])?\s*[^\s,;।]{3,80}/g,'[secret removed]');
 sub(/\bBearer\s+[A-Za-z0-9._~-]+/gi,'[token removed]');
 sub(/\b(?:\d[ -]?){12,19}\b/g,'[financial identifier removed]');
 sub(/(?:\+?91[ -]?)?\b[6-9]\d{9}\b/g,'[phone removed]');
 sub(/\b(?:account|a\/c|acct|खाता)\s*(?:number|no\.?|संख्या)?\s*[:=]?\s*[A-Za-z0-9-]{5,30}/gi,'[account removed]');
 text=text.replace(/https?:\/\/[^\s<>"'।]+/gi,raw=>{try{const u=new URL(raw);if(u.username||u.password||u.search||u.hash){count++;u.username='';u.password='';u.search='';u.hash='';return u.href}return raw}catch{return raw}});
 return {text,count};
}
export function hash(text){let h=2166136261;for(const ch of text)h=Math.imul(h^ch.charCodeAt(0),16777619);return(h>>>0).toString(16)}
export function urls(text){const matches=[...text.matchAll(/https?:\/\/[^\s<>"'।]+/gi)];return matches.map(m=>{const raw=m[0].replace(/[),.;]+$/,'');try{const u=new URL(raw);return{raw,host:u.hostname.toLowerCase().replace(/\.$/,''),offset:m.index,unsafe:!!u.username||!!u.password||u.protocol!=='https:'||u.port&&!['80','443'].includes(u.port),idn:u.hostname.includes('xn--')}}catch{return{raw,host:'',offset:m.index,unsafe:true}}});}
export function relevant(text){return /invest|broker|withdraw|profit|sebi|trading|registration|DEMO-REG|निवेश|ब्रोकर|निकासी|मुनाफा|लाभ|पंजीकरण/i.test(text)}
export function educational(text){return /(?:investor education|educational example|scam warning|beware|do not pay|never pay|don't pay|सावधान|मत भेज|न दें|निवेशक शिक्षा)/i.test(text)&&!/(?:we (?:guarantee|promise)|हम.*(?:गारंटी|पक्का)|pay.*(?:now|immediately)|अभी.*(?:जमा|भुगतान))/i.test(text)}
function matchClaim(event,type,re){const m=re.exec(event.text);if(!m)return null;return{id:event.id+':'+type,type,value:m[0],eventId:event.id,start:m.index,end:m.index+m[0].length,method:'deterministic',uncertainty:'sender claim'};}
export function extract(event){const claims=[];for(const [t,re] of [['registration',/DEMO-REG-\d{3}|\bIN[A-Z]{1,4}\d{6,14}\b/i],['entity',/Sampurna Example Investments|Sampurna Example Investment\b/i],['handle',/@[a-z0-9_]{3,40}/i],['promise',/guarantee[^.!।\n]{0,90}|(?:पक्का|गारंटी)[^।\n]{0,70}/i],['payment',/(?:pay|payment|fee|भुगतान|शुल्क|जमा)[^.!।\n]{0,110}/i]]){const c=matchClaim(event,t,re);if(c)claims.push(c)}if(!claims.some(c=>c.type==='entity')){const m=/(?:I represent|company|entity|firm|संस्था|कंपनी)\s*[:\-]?\s+([^.!।\n]{3,80})/i.exec(event.text);if(m){const start=event.text.indexOf(m[1],m.index);claims.push({id:event.id+':entity',type:'entity',value:m[1],eventId:event.id,start,end:start+m[1].length,method:'label pattern',uncertainty:'ambiguous sender claim'})}}for(const u of urls(event.text))claims.push({id:event.id+':url:'+u.offset,type:'domain',value:u.host,raw:u.raw,eventId:event.id,start:u.offset,end:u.offset+u.raw.length,method:'URL parser',uncertainty:'sender supplied'});return claims}
export function canLink(events,text){const refs=[...text.matchAll(/\bcase[- ]ref[: ]+NR-[A-Z0-9]{8,20}\b/gi)].map(m=>m[0].toUpperCase());return events.some(e=>refs.some(ref=>e.text.toUpperCase().includes(ref)));}
export function makeEvent(text,{synthetic=false,source='paste',id=globalThis.crypto?.randomUUID?.()??String(Date.now()),now=new Date().toISOString(),basis='observed',originalId=null}={}){const r=redact(text);if(!r.text||(!relevant(r.text)&&!(source==='link'&&(urls(r.text).length||/@[a-z0-9_]{3,40}/i.test(r.text)))))throw new Error('irrelevant');return{id,text:r.text,redactions:r.count,hash:hash(r.text),synthetic,source,createdAt:now,completeness:'user-supplied',basis,originalId,claims:[],corrections:[]};}
const lex={
 guaranteed:['Guaranteed-profit wording','पक्के मुनाफे का दावा'],fee:['Payment requested to release funds','पैसे निकालने के लिए भुगतान माँगा गया'],domain:['Domain differs from the reference','वेबसाइट संदर्भ से अलग है'],handle:['Handle differs from the reference','सोशल हैंडल संदर्भ से अलग है'],contradiction:['Later fee demand conflicts with an earlier claim','बाद की शुल्क माँग पहले के दावे से अलग है'],unknown:['Identity evidence is incomplete','पहचान के सबूत अधूरे हैं'],url:['Link needs careful verification','लिंक की जाँच ज़रूरी है'],app:['App installation needs official verification','ऐप स्थापना की आधिकारिक जाँच ज़रूरी है']
};
// Heuristic concern index, not calibrated fraud probability. One contribution per group.
export function concernScore(findings){
 const rules={fee:[60,'payment'],contradiction:[15,'contradiction'],guaranteed:[25,'promise'],domain:[40,'identity'],handle:[20,'identity'],url:[10,'link'],app:[15,'installation']};
 const groups=new Map();
 for(const f of findings){const config=rules[f.rule];if(!config)continue;const [points,group]=config;if(!groups.has(group)||groups.get(group).points<points)groups.set(group,{rule:f.rule,label:f.label,points,eventId:f.eventId});}
 const contributions=[...groups.values()],raw=contributions.reduce((n,c)=>n+c.points,0);
 return {value:Math.min(100,raw),raw,cap:100,contributions,version:'nr-concern-1.0',calibrated:false};
}
export function analyze(events,{fixture=false,sourceMode='available',lang='en',now=new Date().toISOString()}={}){
 const claims=events.flatMap(e=>extract(e));const reg=claims.find(c=>c.type==='registration'),entity=claims.find(c=>c.type==='entity');const found=fixture&&sourceMode==='available'&&reg?.value.toUpperCase()===FIXTURE.registration&&events.every(e=>e.synthetic);
 const check=(id,state,detail,source='none',value='')=>({id,state,detail,source,value,checkedAt:now,sourceDate:source==='fixture'?FIXTURE.date:null,availability:sourceMode,limitation:source==='fixture'?'Synthetic reference. No official verification.':'No automated official-source adapter is connected.'});
 const checks=[check('registration','unverified','lookup'),check('name','unverified','lookup'),check('association','unverified','association'),check('offer','unverified','offer'),check('payment','unverified','payment')];
 if(fixture&&sourceMode==='available'&&events.every(e=>e.synthetic)&&reg&&!found)checks[0]=check('registration','unverified','noMatch','fixture',reg.value);
 if(found){checks[0]=check('registration','supported','record','fixture',FIXTURE.registration);checks[1]=check('name',entity?.value===FIXTURE.name?'supported':entity?'mismatch':'unverified',entity?.value===FIXTURE.name?'nameMatch':entity?'nameMismatch':'nameMissing','fixture',entity?.value??'');if(events.some(e=>/licensed bank|licensed lender|banking licence/i.test(e.text)))checks[0]=check('registration','mismatch','categoryMismatch','fixture',FIXTURE.category);}
 const ds=claims.filter(c=>c.type==='domain');const handle=claims.find(c=>c.type==='handle');
 if(found&&(ds.length||handle)){const mismatch=ds.some(c=>![FIXTURE.domain,'www.'+FIXTURE.domain].includes(c.value))||handle&&handle.value!==FIXTURE.handle;checks[2]=check('association',mismatch?'mismatch':'unverified',mismatch?'domainMismatch':'association','fixture',ds.map(d=>d.value).join(', ')||handle.value);}
 const findings=[];function finding(rule,event,severity,claim){if(findings.some(f=>f.rule===rule&&f.eventId===event.id))return;const span=claim??event.claims?.[0]??{start:0,end:Math.min(event.text.length,220)};findings.push({id:event.id+':'+rule,rule,version:VERSION,eventId:event.id,severity,label:lex[rule][lang==='hi'?1:0],excerpt:event.text.slice(span.start,span.end),start:span.start,end:span.end,checkedAt:now,uncertainty:rule==='domain'||rule==='handle'?'Synthetic reference comparison':'Pattern warning, not a proven scam'});}
 for(const e of events){const cs=claims.filter(c=>c.eventId===e.id);if(educational(e.text))continue;
  if(/(?:guarantee|fixed|assured|risk[- ]free|पक्का|गारंटी|निश्चित).{0,60}(?:profit|return|income|मुनाफा|लाभ)|(?:profit|return).{0,35}guarantee/i.test(e.text))finding('guaranteed',e,'verify',cs.find(c=>c.type==='promise'));
  const fee=/(?:pay|payment|fee|deposit|भुगतान|शुल्क|जमा)/i.test(e.text)&&/(?:unlock|release|withdraw|निकासी|पैसे निकाल)/i.test(e.text)&&!/(?:no withdrawal fee|no fee|कोई शुल्क नहीं|शुल्क नहीं)/i.test(e.text);
  if(fee)finding('fee',e,'strong',cs.find(c=>c.type==='payment'));
  if(found){for(const d of cs.filter(c=>c.type==='domain'))if(![FIXTURE.domain,'www.'+FIXTURE.domain].includes(d.value))finding('domain',e,'strong',d);const h=cs.find(c=>c.type==='handle');if(h&&h.value!==FIXTURE.handle)finding('handle',e,'verify',h);}
  if(urls(e.text).some(u=>u.unsafe||u.idn))finding('url',e,'verify',cs.find(c=>c.type==='domain'));
  if(/install.{0,50}(?:app|apk)|download.{0,50}apk|ऐप.{0,30}इंस्टॉल/i.test(e.text))finding('app',e,'verify');
  const index=events.indexOf(e);const prior=events.slice(0,index).find(x=>!educational(x.text)&&/(?:no withdrawal fee|no fee|कोई शुल्क नहीं|शुल्क नहीं)/i.test(x.text));if(fee&&prior)finding('contradiction',e,'strong',cs.find(c=>c.type==='payment'));
 }
 if(findings.some(f=>f.rule==='fee'))checks[4]=check('payment','unverified','paymentConcern');
 const needsIdentity=claims.some(c=>['registration','entity','domain','handle'].includes(c.type))||events.some(e=>!educational(e.text)&&/(?:offer|investment service|निवेश सेवा)/i.test(e.text));
 const band=findings.some(f=>f.severity==='strong')?'strong':findings.length||needsIdentity?'verify':'limited';
 const stages=[];const add=s=>{if(!stages.includes(s))stages.push(s)};for(const e of events){if(educational(e.text))continue;if(/represent|प्रतिनिधि|offer|प्रस्ताव/i.test(e.text))add('approach');if(extract(e).some(c=>c.type==='registration'))add('identity');if(urls(e.text).length||/install|apk/i.test(e.text))add('portal');if(/(?:shows?|displayed).{0,40}profit|लाभ दिखा/i.test(e.text))add('gains');if(findings.some(f=>f.eventId===e.id&&f.rule==='fee')){add('payment');add('barrier')}}
 return{band,score:concernScore(findings),checks,findings,claims,stages,fixtureUsed:found,unknown:checks.filter(c=>c.state==='unverified').length,mismatches:checks.filter(c=>c.state==='mismatch').length,next:findings.some(f=>f.rule==='fee')?'payment':checks[2].state!=='supported'?'association':'offer',version:VERSION};
}
