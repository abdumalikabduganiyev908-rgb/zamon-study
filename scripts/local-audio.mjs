import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {Readable} from 'node:stream';
import path from 'node:path';
export async function localAudioFile(trackPath){
 if(process.env.NODE_ENV==='production')return null;
 const root=path.resolve('media/audio'),file=path.resolve(root,trackPath);
 if(!file.startsWith(root+path.sep))return null;
 try{const info=await stat(file);return info.isFile()?{file,size:info.size}:null}catch{return null}
}
export function audioResponse(req,fileInfo,filename,download=false){
 const {file,size}=fileInfo,range=req.headers.get('range');let start=0,end=size-1,status=200;
 const headers={'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Cache-Control':'private, no-store','Content-Disposition':`${download?'attachment':'inline'}; filename="${filename.replace(/[^a-zA-Z0-9_.-]/g,'_')}"`};
 if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
 if(!match[1]){const suffix=Number(match[2]);if(suffix<=0)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});start=Math.max(0,size-suffix)}else{start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end)}
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
 status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
 }
 headers['Content-Length']=String(end-start+1);
 return new Response(req.method==='HEAD'?null:Readable.toWeb(createReadStream(file,{start,end})),{status,headers});
}
