import type {Word} from './engine';
import type {Exercise} from './school-types';
export type WordExamples={listening:string[];practice:string[]};
export function validWordExamples(value:unknown,word:Word):value is WordExamples{
 const p=value as WordExamples;if(!p||!Array.isArray(p.listening)||p.listening.length!==2||!Array.isArray(p.practice)||p.practice.length!==3)return false;
 const lines=[...p.listening,...p.practice];
 const escaped=word.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const target=new RegExp(`\\b${escaped}\\b`,'i');
 if(new Set(lines.map(s=>typeof s==='string'?s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim():s)).size!==5)return false;
 return lines.every((s,i)=>typeof s==='string'&&s.length<=300&&target.test(s)&&/[.!?]$/.test(s)&&!/[\n<>]/.test(s)&&s.split(/\s+/).length>=(i<2?4:10)&&s.split(/\s+/).length<=(i<2?9:20));
}
export function wordExercises(w:Word,p:WordExamples):Exercise[]{
 const id=w.id+'-examples-v1';const gap=p.practice[1].replace(new RegExp(`\\b${w.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i'),'_____');
 return [
  {id:id+'-word',kind:'speaking',prompt:'Read the word aloud.',text:w.word,answer:w.word},
  {id:id+'-spelling',kind:'listening',prompt:'Listen and write the word.',audio:w.word,answer:w.word},
  {id:id+'-meaning',kind:'writing',prompt:`Write the Uzbek meaning of “${w.word}”.`,answer:w.uzbekMeaning,accepted:w.acceptedUzbekMeanings},
  {id:id+'-translate',kind:'writing',prompt:`Write the English word for: ${w.uzbekMeaning}`,answer:w.word},
  {id:id+'-listen-1',kind:'listening',prompt:'Listen and write the short sentence.',audio:p.listening[0],answer:p.listening[0]},
  {id:id+'-speak-1',kind:'speaking',prompt:'Read this sentence aloud.',text:p.practice[0],answer:p.practice[0]},
  {id:id+'-gap',kind:'writing',prompt:'Complete the sentence: '+gap,answer:w.word},
  {id:id+'-listen-2',kind:'listening',prompt:'Listen and write the short sentence.',audio:p.listening[1],answer:p.listening[1]},
  {id:id+'-speak-2',kind:'speaking',prompt:'Read this sentence aloud.',text:p.practice[2],answer:p.practice[2]},
 ];
}
