import {createHash,createSign,randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
let cachedToken,expires=0;
export async function credentials(){
 let c;
 if(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)c=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
 else if(process.env.FIREBASE_SERVICE_ACCOUNT_FILE)c=JSON.parse(await readFile(process.env.FIREBASE_SERVICE_ACCOUNT_FILE,'utf8'));
 else throw new Error('Firebase server credentials are missing.');
 if(!c.client_email||!c.private_key||!c.project_id)throw new Error('Invalid Firebase service account.');
 if(c.project_id!==(process.env.FIREBASE_PROJECT_ID||'zamon-c4a03'))throw new Error('Firebase project mismatch.');
 return c;
}
export async function accessToken(){
 if(cachedToken&&Date.now()<expires)return cachedToken;
 const c=await credentials(),now=Math.floor(Date.now()/1000),encode=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const unsigned=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:c.client_email,scope:'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_write',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
 const jwt=unsigned+'.'+createSign('RSA-SHA256').update(unsigned).sign(c.private_key,'base64url');
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:jwt})});
 if(!r.ok)throw new Error('Firebase server authentication failed.');const d=await r.json();cachedToken=d.access_token;expires=Date.now()+(d.expires_in-60)*1000;return cachedToken;
}
const project=()=>process.env.FIREBASE_PROJECT_ID||'zamon-c4a03';
const base=()=>`https://firestore.googleapis.com/v1/projects/${project()}/databases/(default)/documents`;
const sha=x=>createHash('sha256').update(x).digest('hex');
export function pack(v){if(v===null)return {nullValue:null};if(typeof v==='string')return {stringValue:v};if(typeof v==='boolean')return {booleanValue:v};if(typeof v==='number')return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};if(Array.isArray(v))return {arrayValue:{values:v.map(pack)}};return {mapValue:{fields:Object.fromEntries(Object.entries(v).filter(([,v])=>v!==undefined).map(([k,v])=>[k,pack(v)]))}}}
export function unpack(v){if('nullValue'in v)return null;if('stringValue'in v)return v.stringValue;if('booleanValue'in v)return v.booleanValue;if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return v.doubleValue;if('arrayValue'in v)return (v.arrayValue.values||[]).map(unpack);return Object.fromEntries(Object.entries(v.mapValue?.fields||{}).map(([k,v])=>[k,unpack(v)]))}
const fields=o=>pack(o).mapValue.fields;
const row=d=>Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,unpack(v)]));
async function request(path,method='GET',body){const r=await fetch(path.startsWith('https:')?path:base()+path,{method,headers:{Authorization:'Bearer '+await accessToken(),'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});if(!r.ok){const e=new Error('Firebase database request failed (HTTP '+r.status+').');e.status=r.status;throw e}return r.status===204?{}:r.json()}
function key(table,d){switch(table){case 'school_users':return sha(d.identity);case 'school_sessions':return d.token;case 'school_reads':return sha(d.user_id+'|'+d.assignment_id);case 'school_progress':return sha([d.user_id,d.book,d.unit,d.lesson].join('|'));case 'school_notifications':return sha(d.user_id+'|'+d.day);case 'school_push':return sha(d.endpoint);default:return d.id||randomUUID()}}
async function documents(table,query=''){
 const params=new URLSearchParams(query),filters=[...params.entries()].filter(([k])=>!['order','limit','on_conflict'].includes(k));
 const single=filters.find(([,v])=>v.startsWith('eq.'));
 let docs;
 if(single){const [field,value]=single;let val=value.slice(3);if(['unit','unlocked_unit','start_unit','start_lesson'].includes(field))val=Number(val);
 const result=await request(':runQuery','POST',{structuredQuery:{from:[{collectionId:table}],where:{fieldFilter:{field:{fieldPath:field},op:'EQUAL',value:pack(val)}}}});docs=result.filter(x=>x.document).map(x=>x.document);
 }else{docs=[];let next='';do{const result=await request('/'+table+'?pageSize=1000'+(next?'&pageToken='+encodeURIComponent(next):''));docs.push(...result.documents||[]);next=result.nextPageToken||''}while(next)}
 let found=docs.map(d=>({name:d.name,data:row(d)})).filter(({data})=>filters.every(([k,v])=>{const i=v.indexOf('.'),op=v.slice(0,i),value=v.slice(i+1);return op==='eq'?String(data[k])===value:op==='gt'?data[k]>value:op==='lt'?data[k]<value:false}));
 const order=params.get('order');if(order){const [f,dir]=order.split('.');found.sort((a,b)=>a.data[f]===b.data[f]?0:(a.data[f]>b.data[f]?1:-1)*(dir==='desc'?-1:1))}
 const limit=Number(params.get('limit'));if(limit>0)found=found.slice(0,limit);return found;
}
async function loginGuard(who){
 const name=base()+'/school_login_limits/'+sha(who);
 for(let retry=0;retry<6;retry++){
 let old;try{old=await request(name)}catch(e){if(e.status!==404)throw e}
 const data=old?row(old):null,reset=!data||Date.now()-Date.parse(data.window_at)>900000;
 const attempts=reset?1:data.attempts+1;if(attempts>15)return false;
 const doc={identity:who,attempts,window_at:reset?new Date().toISOString():data.window_at};
 const condition=old?'currentDocument.updateTime='+encodeURIComponent(old.updateTime):'currentDocument.exists=false';
 try{await request(name+'?'+condition,'PATCH',{fields:fields(doc)});return true}catch(e){if(![409,412].includes(e.status))throw e}
 }throw new Error('Please retry sign in.');
}
export async function db(table,method='GET',data,query=''){
 if(table==='rpc/school_login_guard')return loginGuard(data.who);
 if(table==='rpc/school_student_stats'){const attempts=await db('school_attempts'),stats=new Map();for(const a of attempts){let s=stats.get(a.user_id);if(!s){s={user_id:a.user_id,lessons:new Set(),seconds:0};stats.set(a.user_id,s)}s.seconds+=a.seconds||0;if(a.completed)s.lessons.add([a.book,a.unit,a.lesson].join('|'))}return [...stats.values()].map(s=>({...s,lessons:s.lessons.size}))}
 if(!/^school_[a-z_]+$/.test(table))throw new Error('Invalid collection.');
 if(method==='GET')return (await documents(table,query)).map(x=>x.data);
 if(method==='POST'){
 const d={...data},id=key(table,d);if(!['school_sessions','school_reads','school_progress','school_notifications'].includes(table))d.id=id;
 if(['school_users','school_attempts','school_assignments'].includes(table))d.created_at ||= new Date().toISOString();
 if(table==='school_users'){d.group_id??=null;d.start_unit??=1;d.start_lesson??=1;d.settings??={language:'en',style:'classic',layout:'cards',accent:'',audioRate:0.65}}
 if(table==='school_attempts'){d.grade??=null;d.comment??=''}
 const merge=['school_reads','school_progress'].includes(table);
 await request('/'+table+'/'+id+(merge?'':'?currentDocument.exists=false'),'PATCH',{fields:fields(d)});return [d];
 }
 const rows=await documents(table,query);for(const item of rows){if(method==='DELETE')await request('https://firestore.googleapis.com/v1/'+item.name,'DELETE');else if(method==='PATCH')await request('https://firestore.googleapis.com/v1/'+item.name+'?'+Object.keys(data).map(k=>'updateMask.fieldPaths='+encodeURIComponent(k)).join('&'),'PATCH',{fields:fields(data)});else throw new Error('Invalid database operation.')}
 return rows.map(x=>({...x.data,...data}));
}
export async function signedAudio(path){
 const c=await credentials(),bucket=process.env.FIREBASE_STORAGE_BUCKET||'zamon-c4a03.firebasestorage.app';
 const r=await fetch(`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent('audio/'+path)}`,{headers:{Authorization:'Bearer '+await accessToken()},cache:'no-store'});if(!r.ok)throw new Error('Audio is not uploaded yet.');
 const enc=v=>encodeURIComponent(v).replace(/[!'()*]/g,ch=>'%'+ch.charCodeAt(0).toString(16).toUpperCase());
 const date=new Date().toISOString().replace(/[-:]|\.\d{3}/g,''),scope=date.slice(0,8)+'/auto/storage/goog4_request';
 const uri='/'+bucket+'/audio/'+path.split('/').map(enc).join('/');
 const params={'X-Goog-Algorithm':'GOOG4-RSA-SHA256','X-Goog-Credential':c.client_email+'/'+scope,'X-Goog-Date':date,'X-Goog-Expires':'3600','X-Goog-SignedHeaders':'host'};
 const query=Object.keys(params).sort().map(k=>enc(k)+'='+enc(params[k])).join('&');
 const canonical=['GET',uri,query,'host:storage.googleapis.com\n','host','UNSIGNED-PAYLOAD'].join('\n');
 const toSign=['GOOG4-RSA-SHA256',date,scope,sha(canonical)].join('\n');
 const signature=createSign('RSA-SHA256').update(toSign).sign(c.private_key,'hex');return 'https://storage.googleapis.com'+uri+'?'+query+'&X-Goog-Signature='+signature;
}

// Activate a pending teacher once. The updateTime precondition prevents two
// concurrent claims (or an outdated invite) from overwriting a password.
export async function activateTeacher(identity,invite,passwordHash){
 const name=base()+'/school_users/'+sha(identity);
 let doc;try{doc=await request(name)}catch(e){if(e.status===404)return null;throw e}
 const user=row(doc);
 if(user.role!=='teacher'||user.password_hash||!user.invite_hash||Date.parse(user.invite_expires_at)<Date.now()||sha(invite)!==user.invite_hash)return null;
 const activated={...user,password_hash:passwordHash,invite_hash:null,invite_expires_at:null};
 try{await request(':commit','POST',{writes:[{update:{name:doc.name,fields:fields(activated)},currentDocument:{updateTime:doc.updateTime}}]})}catch(e){if([409,412].includes(e.status))return null;throw e}
 return activated;
}
