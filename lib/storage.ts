import type {Profile} from './engine';
let dbPromise:Promise<IDBDatabase>|undefined;
function database(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('essential-mastery-v1',1);req.onupgradeneeded=()=>{req.result.createObjectStore('profiles',{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>{dbPromise=undefined;reject(req.error);};});return dbPromise;}
export async function readProfile(id:string):Promise<Profile|undefined>{const db=await database();return new Promise((res,rej)=>{const r=db.transaction('profiles').objectStore('profiles').get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
export async function writeProfile(profile:Profile){const db=await database();return new Promise<void>((res,rej)=>{const tx=db.transaction('profiles','readwrite');tx.objectStore('profiles').put(profile);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);});}
export function download(name:string,content:string,type='application/json'){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
