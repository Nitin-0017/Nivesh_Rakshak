import https from 'node:https';
import {lookup} from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
import {parseHTML} from 'linkedom';
export function publicIP(address){try{return ipaddr.process(address).range()==='unicast';}catch{return false;}}
export function cleanURL(raw){const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443')||u.search||u.hash)throw Error('Use a public HTTPS page without login tokens or query parameters.');return u;}
export async function readPage(raw,depth=0){
 if(depth>3)throw Error('Too many redirects.');const u=cleanURL(raw);
 const addresses=await lookup(u.hostname,{all:true});if(!addresses.length||addresses.some(a=>!publicIP(a.address)))throw Error('Only public websites can be checked.');
 const pinned=addresses[0];
 const response=await new Promise((resolve,reject)=>{
 const req=https.get(u,{headers:{'User-Agent':'NiveshRakshak-LinkCheck/1.0','Accept':'text/html,text/plain'},lookup:(_h,opts,cb)=>opts.all?cb(null,[pinned]):cb(null,pinned.address,pinned.family)},res=>{
 if(res.statusCode>=300&&res.statusCode<400){res.resume();resolve({redirect:res.headers.location});return;}
 if(res.statusCode!==200){res.resume();reject(Error('This website did not allow its content to be read.'));return;}
 if(!/text\/(html|plain)/i.test(res.headers['content-type']||'')){res.resume();reject(Error('This link is not a readable web page.'));return;}
 let size=0,chunks=[];res.on('data',chunk=>{size+=chunk.length;if(size>1000000){req.destroy(Error('Page is too large.'));return;}chunks.push(chunk);});res.on('end',()=>resolve({body:Buffer.concat(chunks).toString('utf8')}));res.on('error',reject);
 });const timer=setTimeout(()=>req.destroy(Error('Website took too long to respond.')),10000);req.on('close',()=>clearTimeout(timer));req.on('error',reject);
 });
 if(response.redirect)return readPage(new URL(response.redirect,u).href,depth+1);
 const {document}=parseHTML(response.body);for(const e of document.querySelectorAll('script,style,noscript,nav,footer,header,form'))e.remove();
 const text=(document.body?.textContent||document.documentElement?.textContent||'').replace(/\s+/g,' ').trim();
 if(text.length<40)throw Error('This page has no readable content; it may require login or JavaScript.');
 return {url:u.href,text:text.slice(0,9000),partial:text.length>9000,retrievedAt:new Date().toISOString()};
}
