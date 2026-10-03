import {randomBytes,scryptSync,createHash} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
import {db} from './firebase-store.mjs';
const rl=createInterface({input:process.stdin,output:process.stdout});
const identityOf=(first,last)=>(first+' '+last).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').replace(/[‘’ʻʼ]/g,"'");
async function teacherInvite(){
 const identity=identityOf('Hamidulloh','Tojiboyev');
 const rows=await db('school_users','GET',undefined,'identity=eq.'+encodeURIComponent(identity));
 if(rows[0]&&(rows[0].role!=='teacher'||rows[0].password_hash)){console.log('An activated account already exists for this name. Its role/password has not been changed.');return}
 const invite=randomBytes(24).toString('base64url'),expiry=new Date(Date.now()+7*864e5).toISOString();
 const data={invite_hash:createHash('sha256').update(invite).digest('hex'),invite_expires_at:expiry};
 if(rows[0])await db('school_users','PATCH',data,'id=eq.'+rows[0].id);
 else await db('school_users','POST',{identity,first_name:'Hamidulloh',last_name:'Tojiboyev',password_hash:'',role:'teacher',book:'essential',unlocked_unit:1,...data});
 console.log('Teacher invitation code (private; share only with Hamidulloh): '+invite);
 console.log('Valid for 7 days, one use. Teacher chooses Teacher → First visit? Set your password and enters name, invitation, and their own password.');
}
async function admin(){const first=(await rl.question('Temporary admin first name: ')).trim(),last=(await rl.question('Temporary admin last name: ')).trim();if(!first||!last)throw new Error('Name is required.');const identity=identityOf(first,last);const existing=await db('school_users','GET',undefined,'identity=eq.'+encodeURIComponent(identity));if(existing.length){console.log('Account already exists; no role or password was changed.');return}const password=await rl.question('Admin password (at least 8 characters; visible in terminal): ');if(password.length<8)throw new Error('Password too short.');const salt=randomBytes(16).toString('hex'),hash=salt+':'+scryptSync(password,salt,64).toString('hex');await db('school_users','POST',{identity,first_name:first,last_name:last,password_hash:hash,role:'admin',book:'essential',unlocked_unit:1});console.log('Admin account created.');}
try{await teacherInvite();if(!process.argv.includes('--teacher-invite-only'))await admin()}finally{rl.close()}
