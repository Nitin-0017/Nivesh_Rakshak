import {test} from 'node:test';import assert from 'node:assert/strict';
import {createVoiceInput} from '../dist/voice.mjs';
let instance;
class Recognition{constructor(){instance=this;}start(){this.onstart();}stop(){this.onend();}abort(){this.aborted=true;}}
test('microphone only starts on explicit action, Hindi language and review after stop',()=>{const statuses=[],texts=[];const c=createVoiceInput({Recognition,lang:'hi-IN',onText:(...v)=>texts.push(v),onStatus:s=>statuses.push(s)});assert.equal(c.active,false);c.start();assert.equal(instance.lang,'hi-IN');assert.equal(c.active,true);const result=[{transcript:'निवेश पर पक्का मुनाफा'}];result.isFinal=true;instance.onresult({resultIndex:0,results:[result]});assert.equal(texts[0][0],'निवेश पर पक्का मुनाफा');c.stop();assert.equal(c.active,false);assert.equal(statuses.at(-1),'review');});
test('permission denied terminates microphone state',()=>{const statuses=[];const c=createVoiceInput({Recognition,lang:'en-IN',onText(){},onStatus:s=>statuses.push(s)});c.start();instance.onerror({error:'not-allowed'});assert.equal(c.active,false);assert.equal(statuses.at(-1),'denied');});
test('navigation cancellation aborts recognition and disables late transcript delivery',()=>{const c=createVoiceInput({Recognition,lang:'en-IN',onText(){throw Error('late text')},onStatus(){}});c.start();c.cancel();assert(instance.aborted);assert.equal(instance.onresult,null);assert.equal(c.active,false);});
test('unsupported browsers offer a typed fallback',()=>{let status;createVoiceInput({Recognition:undefined,lang:'en-IN',onText(){},onStatus:s=>status=s}).start();assert.equal(status,'unsupported');});

test('interim words reach the editor and revisions replace rather than duplicate them',async()=>{
 const {dictationText}=await import('../dist/voice.mjs');let value='Existing message.';
 const c=createVoiceInput({Recognition,lang:'en-IN',onStatus(){},onText:(final,interim)=>{value=dictationText('Existing message.',final,interim)}});
 c.start();assert.equal(instance.continuous,true);assert.equal(instance.interimResults,true);
 const row=(text,isFinal)=>Object.assign([{transcript:text}],{isFinal});
 instance.onresult({resultIndex:0,results:[row('investment prof',false)]});assert.equal(value,'Existing message. investment prof');
 instance.onresult({resultIndex:0,results:[row('investment profit',true),row('guaran',false)]});assert.equal(value,'Existing message. investment profit guaran');
 instance.onresult({resultIndex:1,results:[row('investment profit',true),row('guaranteed',true)]});assert.equal(value,'Existing message. investment profit guaranteed');c.stop();assert.equal(value,'Existing message. investment profit guaranteed');
});
test('stopping retains interim transcript for user review',async()=>{const {dictationText}=await import('../dist/voice.mjs');let value='';const c=createVoiceInput({Recognition,lang:'hi-IN',onStatus(){},onText:(f,i)=>value=dictationText('',f,i)});c.start();instance.onresult({resultIndex:0,results:[Object.assign([{transcript:'पैसे भेजें'}],{isFinal:false})]});c.stop();assert.equal(value,'पैसे भेजें');});
test('speech service network failures have a specific recoverable status',()=>{let status;const c=createVoiceInput({Recognition,lang:'en-IN',onText(){},onStatus:s=>status=s});c.start();instance.onerror({error:'network'});assert.equal(status,'network');assert.equal(c.active,false);});
test('a stalled browser startup releases controls and reports timeout',async()=>{class Silent{start(){}abort(){}}let status;const c=createVoiceInput({Recognition:Silent,lang:'en-IN',onText(){},onStatus:s=>status=s,startTimeoutMs:5});c.start();await new Promise(r=>setTimeout(r,20));assert.equal(status,'start-timeout');assert.equal(c.active,false);});
test('voice drafts stay within the message limit',async()=>{const {dictationText}=await import('../dist/voice.mjs');assert.equal(dictationText('a'.repeat(9999),'b','c').length,10000);});

test('Chrome repeated and overlapping result segments do not duplicate phrases',async()=>{const {mergeSpeechSegments}=await import('../dist/voice.mjs');assert.equal(mergeSpeechSegments(['send money now','send money now','send money now please']),'send money now please');assert.equal(mergeSpeechSegments(['पैसे अभी भेजें','पैसे अभी भेजें']),'पैसे अभी भेजें');assert.equal(mergeSpeechSegments(['no no do not pay']),'no no do not pay');});
