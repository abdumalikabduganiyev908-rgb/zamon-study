import {words} from './engine';
export function isEssential(book:string){return book==='essential'||/^essential-[2-6]$/.test(book)}
export function bookWords(book:string){return words.filter(w=>(w.book||'essential')===book)}
