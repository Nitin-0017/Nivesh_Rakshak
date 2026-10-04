import {modelScore} from './model-score.mjs';
import {CATEGORIES,suggestions} from './ml-classifier.mjs';
const results=new Map();let worker,active,timer;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cancelML(){clearTimeout(timer);if(active){worker?.terminate();worker=null;active=null;}}
export function mountML({host,text,lang,claims,disabled=false,onState=()=>{}}){
 if(!host)return;
 const tr=(en,hi)=>lang==='hi'?hi:en;
 const key=text;const cached=results.get(key);
 host.innerHTML=`<h2>${tr('Understand this message','इस संदेश को समझें')}</h2><p>${tr('What looks suspicious, and what you should do next.','क्या संदिग्ध है और आपको आगे क्या करना चाहिए।')}</p>${cached?'':`<p class="hint">${tr('First use: about 250 MB download. Use Wi-Fi if possible. Your message stays on this device.','पहली बार लगभग 250 MB डाउनलोड होगा। हो सके तो Wi-Fi इस्तेमाल करें। आपका संदेश इसी डिवाइस पर रहता है।')}</p>`}<div class="actions"><button class="btn primary small" data-ml-start ${disabled?'disabled':''}>${cached?tr('Check again','फिर जाँचें'):tr('Retry analysis','फिर जाँचें')}</button><button class="btn small" data-ml-cancel hidden>${tr('Cancel','रद्द करें')}</button></div><p data-ml-status role="status" aria-live="polite" class="hint"></p><div data-ml-output></div><p class="hint">${tr('These suggestions can be wrong. They do not confirm that a sender or offer is genuine.','ये सुझाव गलत हो सकते हैं। इनसे भेजने वाला या प्रस्ताव असली होने की पुष्टि नहीं होती।')}</p>`;

 const start=host.querySelector('[data-ml-start]'),cancel=host.querySelector('[data-ml-cancel]'),status=host.querySelector('[data-ml-status]'),out=host.querySelector('[data-ml-output]');
 function display(r){const found=suggestions(r);const decision=modelScore(r);out.innerHTML=`${decision.reason==='education'?`<p class="notice blue">${tr('This may be an educational warning. Read the full context before treating it as an offer.','यह जानकारी देने वाली चेतावनी हो सकती है। इसे प्रस्ताव मानने से पहले पूरा संदर्भ पढ़ें।')}</p>`:''}${decision.reason==='education'?'':found.length?found.map(r=>{const c=CATEGORIES.find(c=>c.id===r.id);return `<div class="mlFinding"><h3>${escape(lang==='hi'?c.hi:c.en)}</h3><p>${escape((lang==='hi'?c.explainHi:c.explain).replace('The model cannot verify whether the offer is genuine.','The offer still needs independent verification.').replace('मॉडल प्रस्ताव की सच्चाई की पुष्टि नहीं कर सकता।','प्रस्ताव की स्वतंत्र पुष्टि अभी भी ज़रूरी है।'))}</p></div>`;}).join(''):`<p>${tr('We could not identify a clear pattern from the meaning alone. This does not mean the offer is safe.','केवल अर्थ से कोई स्पष्ट पैटर्न नहीं मिला। इसका मतलब प्रस्ताव सुरक्षित होना नहीं है।')}</p>`}<details><summary>${tr('What was checked?','क्या जाँचा गया?')}</summary>${r.truncated?`<p class="notice">${tr('Only the beginning of this long message was checked. Review the remaining text separately.','इस लंबे संदेश की केवल शुरुआत जाँची गई। बाकी पाठ अलग से देखें।')}</p>`:''}<blockquote>${escape(r.analyzedText)}</blockquote><p class="hint">${tr('No official registration, sender or payment verification was performed by this check.','इस जाँच से आधिकारिक पंजीकरण, भेजने वाले या भुगतान की पुष्टि नहीं की गई।')}</p></details>`;}

 if(cached){display(cached);onState({status:"ready",result:cached});}
 start.onclick=()=>{
  if(disabled)return;
  cancelML();onState({status:"loading"});host.setAttribute("aria-busy","true");out.replaceChildren();start.disabled=true;start.textContent=tr("Checking…","जाँच रहे हैं…");cancel.hidden=false;
  status.textContent=tr('Getting ready… Keep this page open.','तैयारी हो रही है… पेज खुला रखें।');
  const id=crypto.randomUUID();active=id;
  try{worker??=new Worker(new URL('./ml-worker.mjs',import.meta.url),{type:'module'});}catch{failed();return;}
  function failed(){host.setAttribute("aria-busy","false");start.textContent=tr("Try again","फिर कोशिश करें");cancelML();onState({status:"error"});start.disabled=false;cancel.hidden=true;status.textContent=tr('This extra check could not finish. The rules-based score and warnings are shown instead. Try again on Wi-Fi or a computer.','यह अतिरिक्त जाँच पूरी नहीं हो सकी। इसके बदले नियम आधारित स्कोर और चेतावनियाँ दिखाई गई हैं। Wi-Fi या कंप्यूटर पर फिर कोशिश करें।');}
  worker.onerror=failed;
  worker.onmessage=({data})=>{if(data.id!==id||active!==id||!host.isConnected)return;if(data.type==='progress'){status.textContent=tr('Preparing this check','जाँच की तैयारी हो रही है')+`: ${Math.round(data.progress||0)}%`;}else if(data.type==='running'){status.textContent=tr('Reading the message on your device…','इसी डिवाइस पर संदेश समझा जा रहा है…');}else if(data.type==='error'){failed();}else if(data.type==='result'){clearTimeout(timer);active=null;if(results.size>=10)results.delete(results.keys().next().value);results.set(key,data.result);display(data.result);onState({status:"ready",result:data.result});host.setAttribute("aria-busy","false");start.textContent=tr("Check again","फिर जाँचें");start.disabled=false;cancel.hidden=true;status.textContent=tr('Check complete at '+new Date().toLocaleTimeString()+'. Review the explanation below.','जाँच पूरी। नीचे संदेश और सुझाव देखें।');}};
  timer=setTimeout(failed,180000);
  try{worker.postMessage({id,text});}catch{failed();}
 };
 cancel.onclick=()=>{host.setAttribute('aria-busy','false');start.textContent=tr('Try again','फिर कोशिश करें');cancelML();onState({status:"cancelled"});start.disabled=false;cancel.hidden=true;status.textContent=tr('Check cancelled. No model score was calculated.','जाँच रद्द। मॉडल स्कोर नहीं निकाला गया।');};
 if(!cached&&!disabled)start.click();
 if(disabled&&!cached)onState({status:"paused"});
}
export function clearML(){cancelML();worker?.terminate();worker=null;results.clear();}

export function cachedML(text){return results.get(text);}
