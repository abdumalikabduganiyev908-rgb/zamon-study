import practice from './data/navigate-practice.json';
import {words,sentenceExamples,writtenExamples,makeQuestion,wordLessonStages,similarity,norm} from './engine';
import {bookById} from './catalog';
import type {Exercise} from './school-types';
export function lessonExercises(book:string,unit:number,lesson:string):Exercise[]{
 if(book==='essential'){
  const ws=words.filter(w=>w.unit===unit);
  if(lesson==='test'){const prior=words.filter(w=>w.unit<unit);const old=[...new Set(prior.map(w=>w.unit))].flatMap(u=>prior.filter(w=>w.unit===u).slice(0,2));return [...ws,...old].map((w,i)=>{const q=makeQuestion(w,['choice','uz-en','context','listening'][i%4],words,i%sentenceExamples(w).length);return{id:q.id,kind:q.audio?'listening':q.options?'choice':'writing',prompt:q.audio?'Listen and write what you hear.':q.type==='uz-en'?`Write the English word for: ${w.uzbekMeaning}`:q.type==='choice'?`Choose the meaning of “${w.word}”.`:q.question.replace('Gapga mos inglizcha so‘zni yozing:','Complete the sentence:'),answer:q.correctAnswer,accepted:q.acceptedAnswers,options:q.options,audio:q.audio}})}
  const w=ws.find(w=>w.id===lesson);if(!w)return[];
  return wordLessonStages(w).map((stage,i)=>{const q=makeQuestion(w,stage.type,words,stage.i);const prompts:Record<string,string>={'speak-word':'Read the word aloud.','speak-sentence':'Read this sentence aloud.','spelling':'Listen and write the word.','dictation':'Listen and write the short sentence.','en-uz':`Write the Uzbek meaning of “${w.word}”.`,'uz-en':`Write the English word for: ${w.uzbekMeaning}`};return{id:q.id+'-'+i,kind:q.speakingText?'speaking':q.audio?'listening':'writing',prompt:prompts[stage.type]||q.question.replace('Gapga mos inglizcha so‘zni yozing:','Complete the sentence:'),answer:q.correctAnswer,accepted:q.acceptedAnswers,audio:q.audio,text:q.speakingText}})
 }
 const b=bookById(book),u=b?.units.find(u=>u.id===unit);if(!u)return[];
 if(lesson==='test')return [...u.sections.flatMap(s=>lessonExercises(book,unit,s.id).filter(q=>!q.open).slice(0,2)),...(unit>1?lessonExercises(book,unit-1,`${unit-1}.1`).filter(q=>!q.open).slice(0,2):[])];
 const section=Number(lesson.split('.')[1]);if(!u.sections.some(s=>s.id===lesson))return[];
 const bank=[...u.sentences,...((practice as Record<string,Record<string,string[]>>)[book]?.[String(unit)]||[])];
 const ordered=bank.map((_,i)=>bank[(i+(section-1)*2)%bank.length]);
 const result:Exercise[]=[];
 for(let i=0;i<3;i++)result.push({id:lesson+'-listen-'+i,kind:'listening',prompt:'Listen and write exactly what you hear.',audio:ordered[i],answer:ordered[i]});
 for(let i=3;i<6;i++)result.push({id:lesson+'-speak-'+i,kind:'speaking',prompt:'Read aloud using your microphone.',text:ordered[i],answer:ordered[i]});
 for(let i=6;i<8;i++){
  const tokens=ordered[i].replace(/[.!?]$/,'').split(' '),index=Math.min(tokens.length-1,Math.max(1,Math.floor(tokens.length/2))),answer=tokens[index];tokens[index]='_____';
  result.push({id:lesson+'-gap-'+i,kind:'writing',prompt:'Complete the sentence: '+tokens.join(' ')+'.',answer});
 }
 for(let i=6;i<8;i++){
  const words=ordered[i].replace(/[.!?]$/,'').split(' ');result.push({id:lesson+'-order-'+i,kind:'writing',prompt:'Put the words in order. Write the complete sentence: '+[...words].reverse().join(' / '),answer:ordered[i]});
 }
 // Meaning choices test understanding of the model, rather than copying it.
 for(let i=0;i<1;i++){const correct=ordered[6+i],other=bank.filter(x=>x!==correct);const choices=[correct,other[(section+i)%other.length],other[(section+i+2)%other.length]].sort();result.push({id:lesson+'-meaning-'+i,kind:'choice',prompt:'Choose the sentence that contains: '+correct.replace(/[.!?]$/,'').split(' ').slice(-2).join(' '),options:choices,answer:correct})}
 result.push({id:lesson+'-own',kind:'writing',prompt:`Write ${b?.level==='A1'||b?.level==='A2'?'3–4 simple sentences':'4–6 sentences with reasons'} about ${u.title.toLowerCase()}. Focus: ${u.sections.find(s=>s.id===lesson)?.title}. Use ${u.grammar}.`,answer:'Teacher review',open:true});
 return result;
}
export function evaluate(q:Exercise,a:string){return q.open?a.trim().split(/\s+/).length>=3:q.kind==='speaking'?similarity(q.answer,a)>=75:[q.answer,...q.accepted||[]].some(v=>norm(v)===norm(a))}
export function requiredLessons(book:string,unit:number){return book==='essential'?words.filter(w=>w.unit===unit).map(w=>w.id):bookById(book)?.units.find(u=>u.id===unit)?.sections.map(s=>s.id)||[]}
