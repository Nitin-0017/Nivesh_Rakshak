import {readPage} from '../lib/link-reader.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 try{const raw=typeof req.body==='string'?JSON.parse(req.body):req.body;if(typeof raw?.url!=='string'||raw.url.length>2000)throw Error('Provide a public HTTPS link.');res.status(200).json(await readPage(raw.url));}
 catch(e){res.status(422).json({error:e.message==='Invalid URL'?'Provide a valid public HTTPS link.':e.message});}
}
