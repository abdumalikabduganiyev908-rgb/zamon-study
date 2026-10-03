import vocabulary from './data/vocabulary.json';
import unitData from './data/units.json';
import elementaryExamples from './data/elementary-examples.json';
import writingExamples from './data/writing-examples.json';
export type Word = typeof vocabulary[number] & {examples?:string[]};
export const words:Word[]=vocabulary;
export const units=unitData;
export const dimensions=['englishToUzbek','uzbekToEnglish','listening','spelling','pronunciation','context'] as const;
export type Dimension=typeof dimensions[number];
export type WordProgress={seen:boolean;counts:Record<string,number>;days:Record<string,string[]>;correct:number;wrong:number;lastReviewed:number;nextReview:number;interval:number;pronunciation:{attempts:number;lastScore:number;bestScore:number;completed:boolean};};
export type Mistake={id:string;question:string;answer:string;correct:string;explanation:string;wordId?:string;unit:number;type:string;times:number;resolved:boolean;lastReviewed:number;};
export type Profile={firstName:string;lastName:string;id:string;currentUnit:number;studied:number[];customUnits:{id:number;title:string;page:number;words:string[];exerciseTypes:string[]}[];unitNames:Record<string,string>;hiddenUnits:number[];hiddenWords:string[];wp:Record<string,WordProgress>;mistakes:Mistake[];notes:Record<string,string>;bookmarks:string[];answered:number;correct:number;studySeconds:number;daySeconds:Record<string,number>;studyDays:string[];grammar:Record<string,{correct:number,total:number}>;settings:{style:string;layout:string;accent:string;theme:string;language:string;required:boolean;sound:boolean;goal:number;audioRate:number};tests:{at:number;score:number;total:number;final:boolean;unit?:number;previousCount?:number}[];imports:Word[];customQuestions:Question[];exerciseAnswers:Record<string,string>;flowCompleted:string[];};
export type Question={id:string;wordId?:string;unit:number;type:string;dimension?:Dimension;question:string;options?:string[];correctAnswer:string;acceptedAnswers:string[];explanation:string;audio?:string;speakingText?:string;sourceType:'book'|'extra'|'ai-generated';verified:boolean;topic?:string;};
export const norm=(s:string)=>s.toLocaleLowerCase().trim().replace(/[‘’ʻʼ`´]/g,"'").replace(/[.!?,;:]/g,'').replace(/\s+/g,' ');
export const dateKey=(n=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tashkent',year:'numeric',month:'2-digit',day:'2-digit'}).format(n);
export function newProfile(firstName:string,lastName:string):Profile{return {firstName:firstName.trim(),lastName:lastName.trim(),id:norm(firstName)+'::'+norm(lastName),currentUnit:1,studied:[1],customUnits:[],unitNames:{},hiddenUnits:[],hiddenWords:[],wp:{},mistakes:[],notes:{},bookmarks:[],answered:0,correct:0,studySeconds:0,daySeconds:{},studyDays:[],grammar:{},settings:{style:'classic',layout:'cards',accent:'',theme:'light',language:'en',required:true,sound:true,goal:20,audioRate:.65},tests:[],imports:[],customQuestions:[],exerciseAnswers:{},flowCompleted:[]};}
export function emptyWP():WordProgress{return {seen:false,counts:{},days:{},correct:0,wrong:0,lastReviewed:0,nextReview:0,interval:0,pronunciation:{attempts:0,lastScore:0,bestScore:0,completed:false}};}
export function dimensionScore(p:WordProgress|undefined,d:Dimension){if(!p)return 0;if(d==='pronunciation')return p.pronunciation.completed?Math.min(100,(p.counts[d]||0)*25):0;return Math.min(100,(p.counts[d]||0)*25);}
export function mastery(p:WordProgress|undefined){if(!p)return 0;const scores=dimensions.map(d=>dimensionScore(p,d));const avg=scores.reduce((a,b)=>a+b,0)/6;const stable=dimensions.every(d=>(p.days[d]||[]).length>=3);return Math.round(stable?avg:Math.min(89,avg));}
export function isMastered(p:WordProgress|undefined){return !!p && dimensions.every(d=>dimensionScore(p,d)>=90&&(p.days[d]||[]).length>=3)&&p.pronunciation.completed;}
export function level(p:WordProgress|undefined){const m=mastery(p);return isMastered(p)?5:m>=75?4:m>=45?3:m>=15?2:p?.seen?1:0;}
export function unitMastery(profile:Profile,unit:number,all=words){const ws=all.filter(w=>w.unit===unit);return ws.length?Math.round(ws.reduce((s,w)=>s+mastery(profile.wp[w.id]),0)/ws.length):0;}
export function overall(profile:Profile,all=words){return Math.round(all.reduce((s,w)=>s+mastery(profile.wp[w.id]),0)/Math.max(1,all.length));}
export function accuracy(p:Profile){return p.answered?Math.round(p.correct/p.answered*100):0;}
export function streak(p:Profile){const dates=new Set(p.studyDays);let n=0;const now=Date.now();if(!dates.has(dateKey(now))&&!dates.has(dateKey(now-864e5)))return 0;let start=dates.has(dateKey(now))?0:1;for(let i=start;i<3650;i++){if(dates.has(dateKey(now-i*864e5)))n++;else break;}return n;}
export function shuffle<T>(a:T[]){return [...a].sort(()=>Math.random()-.5);}
export function validateQuestion(q:Question){return !!q.id&&!!q.question&&!!q.correctAnswer&&q.acceptedAnswers.length>0&&q.acceptedAnswers.some(a=>norm(a)===norm(q.correctAnswer))&&q.verified&&(!q.options||new Set(q.options.map(norm)).size===q.options.length&&q.options.filter(a=>q.acceptedAnswers.some(b=>norm(a)===norm(b))).length===1);}
export function checkAnswer(q:Question,a:string){return q.speakingText?similarity(q.correctAnswer,a)>=80:q.acceptedAnswers.some(x=>norm(x)===norm(a));}
export function answerResult(profile:Profile,q:Question,answer:string,elapsed:number,confidence=3):Profile{
 const p=structuredClone(profile),ok=checkAnswer(q,answer),now=Date.now();p.answered++;if(ok)p.correct++;if(!p.studyDays.includes(dateKey()))p.studyDays.push(dateKey());
 if(q.wordId){const w=p.wp[q.wordId]||emptyWP();w.seen=true;w.lastReviewed=now;if(ok){w.correct++;const d=q.dimension||'context';w.counts[d]=Math.min(4,(w.counts[d]||0)+1);w.days[d]=Array.from(new Set([...(w.days[d]||[]),dateKey()]));if(q.speakingText){const score=similarity(q.correctAnswer,answer);w.pronunciation={attempts:w.pronunciation.attempts+1,lastScore:score,bestScore:Math.max(w.pronunciation.bestScore,score),completed:true};}const factor=elapsed>18000?1.2:confidence<3?1.4:2.2;w.interval=Math.min(60,Math.max(1,Math.round((w.interval||.5)*factor)));w.nextReview=now+w.interval*864e5;}else{w.wrong++;if(q.speakingText){w.pronunciation.attempts++;w.pronunciation.lastScore=similarity(q.correctAnswer,answer);}const d=q.dimension||'context';w.counts[d]=Math.max(0,(w.counts[d]||0)-2);w.days[d]=[];w.interval=0;w.nextReview=now;}p.wp[q.wordId]=w;}
 if(q.topic){const g=p.grammar[q.topic]||{correct:0,total:0};g.total++;if(ok)g.correct++;p.grammar[q.topic]=g;}
 const old=p.mistakes.find(m=>m.id===q.id);if(ok&&old){old.resolved=true;old.lastReviewed=now;}if(!ok){if(old){old.times++;old.answer=answer;old.resolved=false;old.lastReviewed=now;}else p.mistakes.push({id:q.id,question:q.question,answer,correct:q.correctAnswer,explanation:q.explanation,wordId:q.wordId,unit:q.unit,type:q.type,times:1,resolved:false,lastReviewed:now});}
 return p;
}
export function pronounce(profile:Profile,wordId:string,score:number,manual=false){const p=structuredClone(profile);const w=p.wp[wordId]||emptyWP();w.seen=true;w.pronunciation.attempts++;w.pronunciation.lastScore=score;w.pronunciation.bestScore=Math.max(score,w.pronunciation.bestScore);if(!manual&&score>=70){w.pronunciation.completed=true;w.counts.pronunciation=Math.min(4,(w.counts.pronunciation||0)+1);w.days.pronunciation=Array.from(new Set([...(w.days.pronunciation||[]),dateKey()]));}w.lastReviewed=Date.now();w.nextReview=w.nextReview||Date.now()+864e5;p.wp[wordId]=w;return p;}
export function similarity(a:string,b:string){a=norm(a);b=norm(b);if(!a||!b)return 0;const dp=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=0;j<=b.length;j++)dp[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return Math.round((1-dp[a.length][b.length]/Math.max(a.length,b.length))*100);}
export const formats=['en-uz','uz-en','choice','meaning','spelling','context','listening','dictation','true-false'] as const;
export function sentenceExamples(w:Word):string[]{const authored=(elementaryExamples as Record<string,string[]>)[w.word];return w.examples?.length?w.examples:w.sourceType==='book'&&authored?authored:[w.example];}
export function writtenExamples(w:Word):string[]{const authored=(writingExamples as Record<string,string[]>)[w.word];return w.sourceType==='book'&&authored?authored:sentenceExamples(w);}
export function makeQuestion(w:Word,format:string,all=words,exampleIndex?:number):Question{
 const examples=sentenceExamples(w),idx=exampleIndex===undefined?Math.floor(Math.random()*examples.length):exampleIndex%examples.length,sentence=examples[idx],written=writtenExamples(w)[idx%writtenExamples(w).length];
 let question='',correctAnswer='',acceptedAnswers:string[]=[],options:string[]|undefined,audio:string|undefined,dimension:Dimension='context',type=format,speakingText:string|undefined;
 const synonyms=[['pleased','glad','content'],['clever','wise'],['rest','relax'],['answer','reply','respond'],['fear','fright'],['select','choose'],['actual','real'],['trash','garbage'],['method','way'],['chance','opportunity']]; const excluded=new Set(synonyms.find(g=>g.includes(w.word))||[]);const candidates=all.filter(x=>x.id!==w.id&&!excluded.has(x.word)&&!x.acceptedUzbekMeanings.some(a=>w.acceptedUzbekMeanings.some(b=>norm(a)===norm(b))));const local=candidates.filter(x=>x.unit===w.unit);const others=shuffle(local.length>=3?local:candidates);
 switch(format){case'speak-word':question='So‘zni o‘qing va ovoz bilan ayting.';correctAnswer=w.word;acceptedAnswers=[w.word];speakingText=w.word;dimension='pronunciation';break;
 case'speak-sentence':question='Qisqa gapni o‘qing va ovoz bilan ayting.';correctAnswer=sentence;acceptedAnswers=[sentence];speakingText=sentence;dimension='pronunciation';break;
 case'en-uz':question=`“${w.word}” — o‘zbekchasi?`;correctAnswer=w.uzbekMeaning;acceptedAnswers=w.acceptedUzbekMeanings;dimension='englishToUzbek';break;
 case'uz-en':question=`“${w.uzbekMeaning}” — inglizchasi?`;correctAnswer=w.word;acceptedAnswers=[w.word];dimension='uzbekToEnglish';break;
 case'choice':question=`“${w.word}” qaysi ma’noni bildiradi?`;correctAnswer=w.uzbekMeaning;acceptedAnswers=[w.uzbekMeaning];options=shuffle([correctAnswer,...Array.from(new Set(others.map(x=>x.uzbekMeaning))).slice(0,3)]);dimension='englishToUzbek';break;
 case'meaning':question=w.meaning;correctAnswer=w.word;acceptedAnswers=[w.word];options=shuffle([w.word,...others.slice(0,3).map(x=>x.word)]);break;
 case'spelling':question='Eshitgan so‘zingizni xatosiz yozing.';correctAnswer=w.word;acceptedAnswers=[w.word];audio=w.word;dimension='spelling';break;
 case'listening':question='So‘zni eshiting va inglizcha yozing.';correctAnswer=w.word;acceptedAnswers=[w.word];audio=w.word;dimension='listening';break;
 case'dictation':question='Qisqa gapni eshiting va yozing. Kerak bo‘lsa qayta eshiting.';correctAnswer=sentence;acceptedAnswers=[sentence];audio=sentence;dimension='listening';break;
 case'true-false':{const wrong=Math.random()<.5;question=`“${w.word}” — “${wrong?others[0].uzbekMeaning:w.uzbekMeaning}”. To‘g‘rimi?`;correctAnswer=wrong?'Noto‘g‘ri':'To‘g‘ri';acceptedAnswers=[correctAnswer];options=['To‘g‘ri','Noto‘g‘ri'];dimension='englishToUzbek';break;}
 default:{const pattern=new RegExp(`\\b${w.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i');if(pattern.test(written)){question=`Gapga mos inglizcha so‘zni yozing:\n${written.replace(pattern,'_____')}`;correctAnswer=w.word;acceptedAnswers=[w.word];}else{question=w.meaning;correctAnswer=w.word;acceptedAnswers=[w.word];options=shuffle([w.word,...others.slice(0,3).map(x=>x.word)]);}break;}}
 return {id:`${w.id}-${format}${format==='context'||format==='dictation'||format==='speak-sentence'?'-'+idx:''}`,wordId:w.id,unit:w.unit,type,dimension,question,options,correctAnswer,acceptedAnswers,explanation:`${w.word} — ${w.uzbekMeaning}. ${w.meaning}`,audio,speakingText,sourceType:'extra',verified:w.verified};
}
export function pool(p:Profile,mode:string,all=words){const learned=all.filter(w=>p.studied.includes(w.unit)&&p.wp[w.id]?.seen);if(mode==='weak')return learned.sort((a,b)=>mastery(p.wp[a.id])-mastery(p.wp[b.id]));if(mode==='due')return learned.filter(w=>(p.wp[w.id]?.nextReview||0)<=Date.now()).sort((a,b)=>(p.wp[a.id]?.nextReview||0)-(p.wp[b.id]?.nextReview||0));if(mode==='previous')return learned.filter(w=>w.unit!==p.currentUnit);if(mode==='random'||mode==='mock')return shuffle(learned);if(mode==='mistakes')return all.filter(w=>p.mistakes.some(m=>m.wordId===w.id&&!m.resolved));
 const current=shuffle(all.filter(w=>w.unit===p.currentUnit));const old=learned.filter(w=>w.unit!==p.currentUnit);const weak=old.filter(w=>mastery(p.wp[w.id])<75);const mix:Word[]=[];const count=Math.max(20,current.length);for(let i=0;i<count;i++){const chosen=i%10<5?current: i%10<8&&weak.length?weak:old.length?old:current;if(chosen.length)mix.push(chosen[i%chosen.length]);}return mix;
}
export function sessionQuestions(p:Profile,mode:string,count=20,format='mixed',all=words):Question[]{const ws=pool(p,mode,all);if(!ws.length)return [];const qs:Question[]=[];const used=new Set<string>();for(let i=0;i<count*20&&qs.length<count;i++){const w=ws[i%ws.length],f=format==='mixed'?formats[i%formats.length]:format;const q=makeQuestion(w,f,all);if(validateQuestion(q)&&!used.has(q.id)){used.add(q.id);qs.push(q);}}return qs;}
export function bookMastered(p:Profile,all=words){return units.every(u=>unitMastery(p,u.id,all)>=90)&&all.every(w=>isMastered(p.wp[w.id])&&(p.wp[w.id]?.nextReview||0)>Date.now())&&!p.mistakes.some(m=>!m.resolved)&&p.tests.some(t=>t.final&&t.score/t.total>=.9);}

export function restoreDefaults(p:Profile):Profile{const restored={...newProfile(p.firstName,p.lastName),...p,settings:{...newProfile(p.firstName,p.lastName).settings,...p.settings}};const available=[...words,...restored.imports.filter(w=>w.verified)].filter(w=>!restored.hiddenWords.includes(w.id)&&!restored.hiddenUnits.includes(w.unit));if(!unitUnlocked(restored,restored.currentUnit,available))restored.currentUnit=available.map(w=>w.unit).sort((a,b)=>a-b).find(id=>unitUnlocked(restored,id,available))||1;return restored;}

/** One question per current word; older studied units always stay represented. */
export function unitTestQuestions(p:Profile,all=words):Question[]{
 const current=shuffle(all.filter(w=>w.unit===p.currentUnit&&w.verified));
 const easy=['en-uz','uz-en','choice','context','listening'];
 const questions=current.map((w,i)=>makeQuestion(w,easy[i%easy.length],all,i%sentenceExamples(w).length));
 const previous=all.filter(w=>w.verified&&w.unit<p.currentUnit&&p.studied.includes(w.unit)&&p.wp[w.id]?.seen);
 const previousUnits=[...new Set(previous.map(w=>w.unit))].sort((a,b)=>b-a),picked=new Set<string>();
 const old:Question[]=[];
 for(const unit of previousUnits){const ws=shuffle(previous.filter(w=>w.unit===unit)).sort((a,b)=>mastery(p.wp[a.id])-mastery(p.wp[b.id]));if(ws[0]){picked.add(ws[0].id);old.push(makeQuestion(ws[0],old.length%2?'uz-en':'en-uz',all));}}
 const remaining=shuffle(previous.filter(w=>!picked.has(w.id))).sort((a,b)=>mastery(p.wp[a.id])-mastery(p.wp[b.id]));
 for(const w of remaining){if(old.length>=Math.max(10,previousUnits.length))break;old.push(makeQuestion(w,old.length%3===2?'context':old.length%2?'uz-en':'en-uz',all));}
 return shuffle([...questions,...old].filter(validateQuestion));
}

/** Use each sentence context once per lesson, across speaking, listening and writing. */
export function wordLessonStages(w:Word,order?:number[]){
 const examples=sentenceExamples(w);
 const indexes=order&&order.length===examples.length&&new Set(order).size===examples.length&&order.every(i=>Number.isInteger(i)&&i>=0&&i<examples.length)?order:examples.map((_,i)=>i);
 const modes=['speak-sentence','dictation','context','dictation','speak-sentence'];
 return [{type:'speak-word',i:0},{type:'spelling',i:0},{type:'en-uz',i:0},{type:'uz-en',i:0},...indexes.map((i,n)=>({type:modes[n%modes.length],i}))];
}

// Completion is earned by finishing the word lesson, not merely listening.
export const unitPassRatio=.8;
export function completedUnitWords(p:Profile,unit:number,allWords:Word[]=words){return allWords.filter(w=>w.unit===unit&&p.flowCompleted.includes(w.id)).length;}
export function unitWordsFinished(p:Profile,unit:number,allWords:Word[]=words){const list=allWords.filter(w=>w.unit===unit);return list.length>0&&list.every(w=>p.flowCompleted.includes(w.id));}
export function unitPassed(p:Profile,unit:number,allWords:Word[]=words){return unitWordsFinished(p,unit,allWords)&&p.tests.some(t=>t.unit===unit&&t.total>0&&t.score/t.total>=unitPassRatio);}
export function unitUnlocked(p:Profile,unit:number,allWords:Word[]=words){const ids=Array.from(new Set(allWords.map(w=>w.unit))).sort((a,b)=>a-b);return ids.includes(unit)&&ids.filter(id=>id<unit).every(id=>unitPassed(p,id,allWords));}
export function wordUnlocked(p:Profile,w:Word,allWords:Word[]=words){if(!unitUnlocked(p,w.unit,allWords))return false;const list=allWords.filter(x=>x.unit===w.unit);return p.flowCompleted.includes(w.id)||list.findIndex(x=>x.id===w.id)<3+completedUnitWords(p,w.unit,allWords);}
