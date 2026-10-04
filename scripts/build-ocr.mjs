import {mkdir,copyFile,readdir,access,writeFile} from 'node:fs/promises';
const dir='dist/vendor/ocr';await mkdir(dir,{recursive:true});
for(const f of ['tesseract.esm.min.js','worker.min.js','worker.min.js.LICENSE.txt','tesseract.min.js.LICENSE.txt'])await copyFile('node_modules/tesseract.js/dist/'+f,dir+'/'+f);
for(const f of await readdir('node_modules/tesseract.js-core'))if(f.endsWith('.wasm.js')||f==='LICENSE')await copyFile('node_modules/tesseract.js-core/'+f,dir+'/'+f);
for(const lang of ['eng','hin']){const file=dir+'/'+lang+'.traineddata';try{await access(file);}catch{const r=await fetch('https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/'+lang+'.traineddata');if(!r.ok)throw Error('OCR download failed');await writeFile(file,Buffer.from(await r.arrayBuffer()));}}
