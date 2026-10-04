/** User-started browser dictation. Never auto-submits or restarts the microphone. */
export function createVoiceInput({Recognition,lang,onText,onStatus,timeoutMs=60000,startTimeoutMs=15000}) {
 let recognition=null,timer,startTimer,stopTimer,active=false,stopping=false;
 function finish(status){clearTimeout(timer);clearTimeout(startTimer);clearTimeout(stopTimer);active=false;stopping=false;if(status)onStatus(status);}
 function detach(){if(recognition){recognition.onstart=null;recognition.onresult=null;recognition.onend=null;recognition.onerror=null;}}
 const controller={
  get active(){return active;},
  start(){
   if(active)return;
   if(!Recognition){onStatus('unsupported');return;}
   try{recognition=new Recognition();}catch{onStatus('error');return;}
   recognition.lang=lang;recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;
   active=true;stopping=false;onStatus('starting');
   recognition.onstart=()=>{if(!active)return;clearTimeout(startTimer);onStatus('listening');timer=setTimeout(()=>controller.stop(),timeoutMs);};
   recognition.onresult=e=>{
    if(!active)return;
    // Results are cumulative for this session. Rebuild instead of appending revisions twice.
    const final=[],interim=[];
    for(let i=0;i<e.results.length;i++){
     const transcript=e.results[i]?.[0]?.transcript?.trim();
     if(transcript)(e.results[i].isFinal?final:interim).push(transcript);
    }
    const stable=mergeSpeechSegments(final);
    const combined=mergeSpeechSegments([stable,...interim]);
    onText(stable,combined.slice(stable.length).trim());
   };
   recognition.onerror=e=>{if(!active)return;const status={'not-allowed':'denied','service-not-allowed':'denied','no-speech':'no-speech','audio-capture':'microphone','network':'network','language-not-supported':'language','aborted':'review'}[e.error]||'error';detach();try{recognition.abort();}catch{}finish(status);};
   recognition.onend=()=>{if(active){detach();finish('review');}};
   startTimer=setTimeout(()=>{if(!active)return;detach();try{recognition.abort();}catch{}finish('start-timeout');},startTimeoutMs);
   try{recognition.start();}catch{detach();finish('error');}
  },
  stop(){if(!active||stopping)return;stopping=true;onStatus('stopping');clearTimeout(timer);clearTimeout(startTimer);try{recognition.stop();}catch{detach();finish('review');return;}if(active)stopTimer=setTimeout(()=>{detach();try{recognition.abort();}catch{}finish('review');},1500);},
  cancel(){detach();finish();try{recognition?.abort();}catch{}recognition=null;}
 };
 return controller;
}
export function dictationText(base,final,interim,maxLength=10000){return [base.trim(),final.trim(),interim.trim()].filter(Boolean).join(' ').slice(0,maxLength);}

// Some speech providers repeat previous words in a new result segment.
// Only join overlapping segment boundaries; never remove repeats inside an utterance.
export function mergeSpeechSegments(segments){
 const words=[];const normal=w=>w.toLocaleLowerCase().replace(/[.,!?।،:;]+$/u,'');
 for(const segment of segments){const next=String(segment).trim().split(/\s+/).filter(Boolean);let overlap=0;
 for(let n=Math.min(words.length,next.length);n>=2;n--)if(words.slice(-n).every((w,i)=>normal(w)===normal(next[i]))){overlap=n;break;}
 words.push(...next.slice(overlap));}
 return words.join(' ');
}
