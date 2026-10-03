import type {Question} from './engine';
import checkedBookQuestions from './data/checked-book-questions.json';
export const grammarTopics=[
{id:'present-simple',name:'Present Simple',rule:'Odatlar va doimiy holatlar uchun. He / she / it bilan fe’lga -s yoki -es qo‘shiladi.',positive:'She works at a school.',negative:'She does not work on Sundays.',question:'Does she work here?',mistake:'She go → She goes. Does she works → Does she work.',speaking:'I usually study English in the evening.'},
{id:'present-continuous',name:'Present Continuous',rule:'Hozir sodir bo‘layotgan ish: am / is / are + verb-ing.',positive:'I am reading a book.',negative:'He is not sleeping.',question:'Are you listening?',mistake:'I reading → I am reading.',speaking:'I am practising English right now.'},
{id:'past-simple',name:'Past Simple',rule:'Tugagan ish-harakatlar. Oddiy fe’lga -ed qo‘shiladi; go → went kabi istisnolar bor. Did bilan asosiy fe’l ishlatiladi.',positive:'We visited our friends yesterday.',negative:'I did not go to school yesterday.',question:'Did you watch the film?',mistake:'Did you went → Did you go.',speaking:'I went to the market yesterday.'},
{id:'future',name:'Future: will / going to',rule:'Will — taxmin yoki hozir qabul qilingan qaror; going to — oldindan belgilangan reja.',positive:'I am going to study tonight.',negative:'I will not be late.',question:'Will you help me?',mistake:'I going to → I am going to.',speaking:'I am going to visit my friend tomorrow.'},
{id:'present-perfect',name:'Present Perfect',rule:'Have / has + past participle. Natijasi hozir muhim bo‘lgan yoki vaqt aytilmagan tajriba.',positive:'I have finished my homework.',negative:'She has not seen this film.',question:'Have you ever been to Samarkand?',mistake:'She have → She has. Aniq yesterday bilan Past Simple ishlatiladi.',speaking:'I have already finished my homework.'},
{id:'articles',name:'Articles: a / an / the',rule:'A / an — bitta, noma’lum sanaladigan narsa. An unli tovushdan oldin. The — qaysi biri ekani ma’lum.',positive:'She is a teacher. I ate an apple.',negative:'This is not the book I need.',question:'Is he an engineer?',mistake:'An university → a university (boshlanish tovushi /j/).',speaking:'I bought a book. The book is interesting.'},
{id:'modals',name:'Can / must / should',rule:'Modal fe’ldan keyin asosiy fe’l. Can — qobiliyat; must — zarurat; should — maslahat.',positive:'You should drink more water.',negative:'He cannot swim.',question:'Can you help me?',mistake:'She can sings → She can sing.',speaking:'I can use a computer.'},
{id:'comparatives',name:'Comparatives & superlatives',rule:'Short adjective + -er / -est; uzun sifatlarda more / most. Good → better → best.',positive:'This bag is cheaper than that one.',negative:'This test is not more difficult.',question:'Which book is the best?',mistake:'More better → better.',speaking:'English is easier when I practise every day.'},
{id:'prepositions',name:'Time & place prepositions',rule:'At — vaqt / aniq nuqta; on — kun / sirt; in — oy, yil yoki joy ichida.',positive:'My lesson starts at four on Tuesday.',negative:'I am not at home.',question:'Is the book on the table?',mistake:'In Monday → on Monday.',speaking:'I study English on Tuesdays.'},
{id:'countables',name:'Countable & uncountable',rule:'Many — sanaladigan ko‘plik; much — sanalmaydigan. Some odatda darak, any savol va inkorda.',positive:'There are some apples. There is some water.',negative:'We do not have any milk.',question:'How many books do you have?',mistake:'Many water → much water.',speaking:'I drink a little water after exercise.'}
];
const rows=[
['present-simple','fix','She go to school every day.','She goes to school every day.'],
['present-simple','blank','He _____ English every evening.','studies','study|studies|studying|studied'],
['present-simple','transform','Make negative: I like coffee.','I do not like coffee.',"I don't like coffee."],
['present-simple','order','usually / I / walk / to / school','I usually walk to school.'],
['present-simple','translation','Men har kuni ingliz tilini o‘rganaman.','I study English every day.','I learn English every day.'],
['present-simple','dialogue','A: Do you play football? B: Yes, _____.','I do','I do|I am|I did|I have'],
['present-simple','true-false','“He works at a hospital.” grammatik jihatdan to‘g‘ri.','To‘g‘ri','To‘g‘ri|Noto‘g‘ri'],
['present-continuous','blank','Look! The children _____ football.','are playing','play|are playing|plays|played'],
['present-continuous','fix','I reading a book now.','I am reading a book now.',"I'm reading a book now."],
['present-continuous','transform','Make a question: She is studying.','Is she studying?'],
['present-continuous','order','are / What / you / doing','What are you doing?'],
['past-simple','fix','Did you went to school yesterday?','Did you go to school yesterday?'],
['past-simple','blank','Yesterday we _____ our grandmother.','visited','visit|visits|visited|visiting'],
['past-simple','transform','Make negative: I saw him yesterday.','I did not see him yesterday.',"I didn't see him yesterday."],
['past-simple','translation','Men kecha bozorga bordim.','I went to the market yesterday.','Yesterday I went to the market.'],
['future','blank','We _____ visit our friends tomorrow.','are going to','are going to|going to|went to|goes to'],
['future','fix','She will helps me tomorrow.','She will help me tomorrow.'],
['future','order','will / I / call / you / later','I will call you later.'],
['present-perfect','blank','She _____ already finished her work.','has','have|has|is|does'],
['present-perfect','fix','I have saw that film.','I have seen that film.',"I've seen that film."],
['present-perfect','transform','Make a question: You have finished.','Have you finished?'],
['articles','blank','He is _____ engineer.','an','a|an|the|some'],
['articles','fix','I study at an university.','I study at a university.'],
['articles','blank','I bought a book yesterday. _____ book is excellent.','The','A|An|The|Some'],
['modals','fix','She can sings very well.','She can sing very well.'],
['modals','blank','You _____ wear a seat belt in a car.','must','must|can to|must to|should to'],
['modals','transform','Make negative: He can swim.','He cannot swim.',"He can't swim."],
['comparatives','fix','This phone is more cheaper than that one.','This phone is cheaper than that one.'],
['comparatives','blank','This is the _____ book I have read.','best','good|better|best|more good'],
['comparatives','order','is / taller / My / brother / than / me','My brother is taller than me.'],
['prepositions','blank','Our English lesson is _____ Tuesday.','on','in|on|at|to'],
['prepositions','blank','The class starts _____ four o’clock.','at','in|on|at|from'],
['prepositions','fix','My birthday is on September.','My birthday is in September.'],
['countables','blank','How _____ apples do you want?','many','much|many|a little|any'],
['countables','fix','I do not have some money.','I do not have any money.',"I don't have any money."],
['countables','blank','There is _____ water in the glass.','some','many|a few|some|an']
];
export const grammarQuestions:Question[]=rows.map((r,i)=>({id:'grammar-'+i,unit:0,topic:r[0],type:r[1],question:r[2],correctAnswer:r[3],acceptedAnswers:[r[3],...(!r[4]?.includes('|')&&r[4]?[r[4]]:[])],options:r[4]?.includes('|')?r[4].split('|'):undefined,explanation:grammarTopics.find(t=>t.id===r[0])!.rule,sourceType:'extra',verified:true}));
const firstUnitQuestions:Question[]=[
['bad or hurting others','cruel','afraid|clever|cruel|hunt'],['at last or at the end','finally','angry|clever|finally|reply'],['to try to fight or hurt','attack','attack|middle|pleased|trick'],['to not let others see','hide','agree|hide|safe|well'],['the lowest part','bottom','bottom|lot|moment|promise'],['angry','mad','happy|low|mad|scared'],['moment','a short time','a hole with water in it|a short time|at the center|at the end'],['promise','to say “I will”','to say “good job”|to say “I will”|to say “the end”|to say “maybe”'],['reply','to answer','to answer|to get to a place|to look for in order to kill|to try to fight or hurt'],['safe','not worried about being hurt','fool|having much or many|not seen|not worried about being hurt']
].map((r,i)=>({id:'book-u1-'+i,unit:1,type:'Book exercise',dimension:'context',wordId:'u1-'+(i<5?r[1]:r[0]),question:r[0],correctAnswer:r[1],acceptedAnswers:[r[1]],options:r[2].split('|'),explanation:`${i<5?r[1]:r[0]}: ${i<5?r[0]:r[1]}. Source: Unit 1, p.10.`,sourceType:'book',verified:true}));

export const bookQuestions:Question[]=checkedBookQuestions.map(q=>({...q,wordId:q.wordId||undefined,dimension:"context" as const,sourceType:"book" as const}));
