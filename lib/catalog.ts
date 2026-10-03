import navigate from './data/navigate-catalog.json';
import unitData from './data/units.json';
export const books=[{id:'essential',title:'Essential English Words 1',level:'Vocabulary',units:unitData.map(u=>({id:u.id,title:u.title,grammar:'Vocabulary',sentences:[] as string[],video:null as string|null,sections:[] as {id:string;title:string}[]}))},...navigate];
export function bookById(id:string){return books.find(b=>b.id===id)}
