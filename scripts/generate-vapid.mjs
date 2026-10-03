import webpush from 'web-push';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {loadEnvFile} from 'node:process';
const file='.env.local';
if(existsSync(file))loadEnvFile(file);
let publicKey=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim(),privateKey=process.env.VAPID_PRIVATE_KEY?.trim();
if(Boolean(publicKey)!==Boolean(privateKey))throw new Error('Only one VAPID key is configured. Restore its matching key; an existing key will not be replaced.');
const created=!publicKey;
if(created){const keys=webpush.generateVAPIDKeys();publicKey=keys.publicKey;privateKey=keys.privateKey;}
const subject=process.env.VAPID_SUBJECT?.trim()||'https://zamon-study.netlify.app';
webpush.setVapidDetails(subject,publicKey,privateKey);
let content=existsSync(file)?readFileSync(file,'utf8'):'';
for(const [name,value] of Object.entries({NEXT_PUBLIC_VAPID_PUBLIC_KEY:publicKey,VAPID_PRIVATE_KEY:privateKey,VAPID_SUBJECT:subject})){
 const pattern=new RegExp('^\\s*(?:export\\s+)?'+name+'\\s*=.*$','m');
 if(pattern.test(content))content=content.replace(pattern,`${name}=${value}`);
 else content+=(content&&!content.endsWith('\n')?'\n':'')+`${name}=${value}\n`;
}
writeFileSync(file,content,{mode:0o600});
console.log(created?'VAPID keys created and saved to .env.local.':'Existing VAPID keys kept and saved to .env.local.');
console.log('Copy NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT from .env.local into Netlify environment variables.');
console.log('Keep the private key out of GitHub. Restart pnpm dev, or redeploy after updating Netlify.');
