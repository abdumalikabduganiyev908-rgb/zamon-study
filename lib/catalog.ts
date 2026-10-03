import navigate from './data/navigate-catalog.json';
import unitData from './data/units.json';
import essentialCatalog from './data/essential-catalog.json';
type Book={id:string;title:string;level:string;units:{id:number;title:string;grammar:string;sentences:string[];video:string|null;sections:{id:string;title:string}[]}[]};
export const books:Book[]=[{id:'essential',title:'Essential English Words 1',level:'Vocabulary',units:unitData.map(u=>({id:u.id,title:u.title,grammar:'Vocabulary',sentences:[] as string[],video:null as string|null,sections:[] as {id:string;title:string}[]}))},...essentialCatalog,...navigate];
export function bookById(id:string){return books.find(b=>b.id===id)}
