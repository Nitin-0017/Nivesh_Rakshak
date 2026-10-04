import {pipeline,env} from '@huggingface/transformers';
import {MODEL,REVISION,classifyText} from './classifier.mjs';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
env.backends.onnx.wasm.wasmPaths={mjs:new URL('./vendor/ort-wasm-simd-threaded.asyncify.mjs',self.location.href).href,wasm:new URL('./vendor/ort-wasm-simd-threaded.asyncify.wasm',self.location.href).href};
let classifier;
self.onmessage=async({data})=>{
 const {id,text}=data;
 try{
  classifier??=pipeline('zero-shot-classification',MODEL,{revision:REVISION,dtype:'fp16',device:'wasm',progress_callback:p=>{if(p.status==='progress')self.postMessage({id,type:'progress',file:p.file,progress:p.progress});}});
  const model=await classifier;self.postMessage({id,type:'running'});
  const result=await classifyText(model,text);self.postMessage({id,type:'result',result});
 }catch{classifier=null;self.postMessage({id,type:'error'});}
};
