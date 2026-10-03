'use client';
import {useState} from 'react';
import {books,bookById} from '@/lib/catalog';
import {isEssential} from '@/lib/essential';
import {requiredLessons} from '@/lib/lessons';
import type {StudyTrack} from '@/lib/school-types';
export function StudyStartFields({family,initial,disabled=false,t=(en)=>en}:{family:'navigate'|'essential';initial?:StudyTrack;disabled?:boolean;t?:(en:string,uz:string)=>string}){
 const list=books.filter(b=>isEssential(b.id)===(family==='essential'));
 const [book,setBook]=useState(initial?.book||list[0].id),[unit,setUnit]=useState(initial?.unlockedUnit||1);
 const initialStep=initial?.book===book&&initial.unlockedUnit===unit&&initial.startUnit===unit?initial.startLesson:1;
 return <fieldset disabled={disabled} style={{display:'grid',gap:16,minWidth:0}}><legend>{family==='navigate'?t('Navigate — main course','Navigate — asosiy kitob'):t('Essential — vocabulary companion','Essential — qo‘shimcha lug‘at kitobi')}</legend><label>{t('Book','Kitob')}<select name={family+'Book'} value={book} onChange={e=>{setBook(e.target.value);setUnit(1)}}>{list.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select></label><label>{t('Current Unit','Hozirgi UNIT')}<select name={family+'Unit'} value={unit} onChange={e=>setUnit(Number(e.target.value))}>{bookById(book)!.units.map(u=><option key={u.id} value={u.id}>Unit {u.id} — {u.title}</option>)}</select></label>{family==='essential'?<input type="hidden" name="essentialLesson" value={initialStep}/>:<label>{t('Current lesson','Hozirgi dars')}<select name="navigateLesson" key={book+'-'+unit} defaultValue={initialStep}>{requiredLessons(book,unit).map((id,i)=><option key={id} value={i+1}>{bookById(book)?.units.find(u=>u.id===unit)?.sections.find(s=>s.id===id)?.id+' — '+bookById(book)?.units.find(u=>u.id===unit)?.sections.find(s=>s.id===id)?.title}</option>)}</select></label>}</fieldset>;
}
