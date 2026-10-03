import 'server-only';
import {AsyncLocalStorage} from 'node:async_hooks';
export type CenterScope={centerId:string|null;owner:boolean};
export const centerContext=new AsyncLocalStorage<CenterScope>();
export function schoolScope<T>(work:()=>Promise<T>){return centerContext.run({centerId:null,owner:false},work)}
export const legacyCenter='zamon';
