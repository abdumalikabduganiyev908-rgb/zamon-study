import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {accessToken} from './firebase-store.mjs';
const bucket=process.env.FIREBASE_STORAGE_BUCKET||'zamon-c4a03.firebasestorage.app';
const root=path.resolve(process.argv[2]||'media/audio');let uploaded=0;
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory())await walk(full);else if(e.name.endsWith('.mp3')){const rel=path.relative(root,full).split(path.sep).join('/');const r=await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodeURIComponent('audio/'+rel)}`,{method:'POST',headers:{Authorization:'Bearer '+await accessToken(),'Content-Type':'audio/mpeg'},body:await readFile(full)});if(!r.ok)throw new Error('Upload failed: '+rel+' (HTTP '+r.status+'). Enable Firebase Storage and check the server account permissions.');uploaded++;if(uploaded%50===0)console.log(uploaded+' tracks uploaded.');}}}
await walk(root);console.log('Done: '+uploaded+' tracks uploaded to private Firebase Storage.');
