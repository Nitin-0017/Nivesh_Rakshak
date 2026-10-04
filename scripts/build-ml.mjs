import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/vendor',{recursive:true});
await build({entryPoints:['src/ml/worker.mjs'],outfile:'dist/ml-worker.mjs',bundle:true,format:'esm',platform:'browser',minify:true});
await copyFile('src/ml/decision.mjs','dist/ml-decision.mjs');
const {readFile,writeFile}=await import('node:fs/promises');
await writeFile('dist/ml-classifier.mjs',(await readFile('src/ml/classifier.mjs','utf8')).replace("'./decision.mjs'","'./ml-decision.mjs'"));
for(const f of ['ort-wasm-simd-threaded.asyncify.mjs','ort-wasm-simd-threaded.asyncify.wasm'])await copyFile('node_modules/onnxruntime-web/dist/'+f,'dist/vendor/'+f);
console.log('Browser ML worker and local WASM runtime built. Model weights download only on request.');
