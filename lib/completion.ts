import {requiredLessons} from './lessons';
import type {StudyTrack} from './school-types';
/** Progress rows belong to the current account; unlocked access alone is not completion. */
export function completionIndex(progress:readonly {book:string;unit:number;lesson:string}[]){return new Set(progress.map(p=>`${p.book}/${p.unit}/${p.lesson}`));}
export function unitCompleted(index:ReadonlySet<string>,book:string,unit:number,course?:StudyTrack){
 if(!index.has(`${book}/${unit}/test`))return false;
 const skipped=course?.book===book&&course.startUnit===unit?course.startLesson-1:0;
 const lessons=requiredLessons(book,unit);
 return lessons.length>0&&lessons.every((lesson,i)=>i<skipped||index.has(`${book}/${unit}/${lesson}`));
}
export function bookCompleted(index:ReadonlySet<string>,book:{id:string;units:readonly {id:number}[]},course?:StudyTrack){return book.units.length>0&&book.units.every(unit=>unitCompleted(index,book.id,unit.id,course));}
