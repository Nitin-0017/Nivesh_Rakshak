import Tesseract from './vendor/ocr/tesseract.esm.min.js';
export async function readScreenshot(file,onProgress){
 let worker,timer,expired=false;const dir=new URL('./vendor/ocr/',import.meta.url).href;
 const timeout=new Promise((_,reject)=>timer=setTimeout(()=>{expired=true;reject(Error('Screenshot reading timed out. Try a clearer, smaller image.'));},90000));
 const task=(async()=>{worker=await Tesseract.createWorker('eng+hin',1,{workerPath:dir+'worker.min.js',corePath:dir,langPath:dir,gzip:false,workerBlobURL:false,logger:m=>onProgress(m.progress||0)});if(expired){await worker.terminate();throw Error('Timed out');}const {data}=await worker.recognize(file);if(!data.text.trim())throw Error('No readable text found. Choose a clearer screenshot.');return data.text.trim();})();
 try{return await Promise.race([task,timeout]);}finally{clearTimeout(timer);await worker?.terminate();}
}
