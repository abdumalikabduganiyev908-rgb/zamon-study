import {paymentState,tashkentDate} from './billing';
import 'server-only';
import {createHash,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import type {User} from './school-types';
export class AppError extends Error {constructor(message:string,public status=400){super(message)}}
// Shared server-only Firestore adapter; browser access is denied by rules.
// @ts-ignore JavaScript adapter shared with setup scripts and scheduled jobs.
import {db as firebaseDb,activateTeacher as firebaseActivateTeacher,claimPendingTeacher as firebaseClaimPendingTeacher,createAdministrator as firebaseCreateAdministrator,resignTemporaryAdministrator as firebaseResignTemporaryAdministrator} from '../scripts/firebase-store.mjs';
export async function db(table:string,method='GET',data?:unknown,query=''){try{return await firebaseDb(table,method,data,query)}catch(e:any){if(e.status===409)throw new AppError('This record already exists.',409);console.error('Firebase request failed',table,e.status||'configuration');throw new AppError('Firebase is not connected or the operation failed. Please contact your teacher.',503)}}
export function hashPassword(p:string){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(p,salt,64).toString('hex')}
export function verifyPassword(p:string,h:string){try{const [s,v]=h.split(':');const a=Buffer.from(v,'hex'),b=scryptSync(p,s,64);return a.length===b.length&&timingSafeEqual(a,b)}catch{return false}}
export function digest(s:string){return createHash('sha256').update(s).digest('hex')}
export function safeUser(r:any):User{return {id:r.id,firstName:r.first_name,lastName:r.last_name,role:r.role,groupId:r.group_id,book:r.book,unlockedUnit:r.unlocked_unit,startUnit:r.start_unit||1,startLesson:r.start_lesson||1,createdAt:r.created_at,disabled:!!r.disabled,temporaryAdministrator:!!r.temporary_administrator,payment:paymentState(r.billing),settings:r.settings}}
export async function current(req:Request,allowBlocked=false){const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('school_session='))?.split('=')[1];if(!token)throw new AppError('Please sign in.',401);const sessions=await db('school_sessions','GET',undefined,`token=eq.${digest(token)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`);if(!sessions[0])throw new AppError('Your session has expired. Please sign in again.',401);const rows=await db('school_users','GET',undefined,`id=eq.${sessions[0].user_id}`);if(!rows[0])throw new AppError('Please sign in.',401);let row=rows[0];if(!row.billing){row={...row,billing:{status:'paid',paidAt:tashkentDate()}};await db('school_users','PATCH',{billing:row.billing},`id=eq.${row.id}`)}if(row.disabled)throw new AppError('Your account has been disabled by the Administrator.',403);const user=safeUser(row);if(!allowBlocked&&user.role==='student'&&user.payment.blocked)throw new AppError('Oylik to‘lovni tezroq to‘lang. Administrator to‘langan deb belgilagach darslar ochiladi.',402);return user}
export function mutation(req:Request){const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==(req.headers.get('host')||new URL(req.url).host))throw new AppError('Request denied.',403)}
export function teacher(u:User){if(u.role!=='teacher')throw new AppError('Only the teacher can change this.',403)}
export function staff(u:User){if(!['teacher','admin','administrator'].includes(u.role))throw new AppError('Teacher access required.',403)}
export function textValue(v:unknown,max=4000){if(typeof v!=='string'||!v.trim()||v.length>max)throw new AppError('Please check the entered text.');return v.trim()}
export function fail(e:unknown){return Response.json({error:e instanceof AppError?e.message:'Something went wrong. Please try again.'},{status:e instanceof AppError?e.status:500,headers:{'Cache-Control':'no-store'}})}
export function permitted(u:User,book:string,unit:number){return u.role!=='student'||u.book===book&&unit<=u.unlockedUnit}

export async function activateTeacher(identity:string,invite:string,passwordHash:string){try{return await firebaseActivateTeacher(identity,invite,passwordHash)}catch{throw new AppError('Could not activate the teacher account. Please try again.',503)}}

export async function claimPendingTeacher(identity:string,passwordHash:string){try{return await firebaseClaimPendingTeacher(identity,passwordHash)}catch{throw new AppError("Could not create teacher account. Try again.",503)}}

export function administrator(u:User){if(u.role!=='administrator')throw new AppError('Only the Administrator can change this.',403)}

export async function createAdministrator(data:any,expectedHash:string|null=null){try{return await firebaseCreateAdministrator(data,expectedHash)}catch{throw new AppError("Could not create Administrator account. Try again.",503)}}

export async function resignTemporaryAdministrator(userId:string){try{return await firebaseResignTemporaryAdministrator(userId)}catch{throw new AppError("Could not leave Administrator role. Try again.",503)}}
