import {createInterface} from 'node:readline/promises';
import {temporaryAdministrator} from './firebase-store.mjs';
const rl=createInterface({input:process.stdin,output:process.stdout});
try{
 const first=(await rl.question('Existing account first name: ')).trim(),last=(await rl.question('Existing account last name: ')).trim();
 if(!first||!last||first.length>60||last.length>60)throw new Error('Enter your existing first and last name.');
 const identity=(first+' '+last).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').replace(/[‘’ʻʼ]/g,"'");
 const user=await temporaryAdministrator(identity);
 console.log('Temporary Administrator granted: '+user.first_name+' '+user.last_name);
 console.log('Your existing password and learning progress have been preserved.');
 console.log('Sign in with the existing password. Settings → Leave Administrator role returns you to Student.');
}catch(e){console.error(e.message);process.exitCode=1}finally{rl.close()}
