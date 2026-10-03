import {bookById} from './catalog';
import {requiredLessons} from './lessons';
import {bookFamily} from './study-tracks';
import {AppError} from './school-server';
import type {StudyTrack,StudyTracks} from './school-types';
export function selectedTrack(value:any,family:'navigate'|'essential'):StudyTrack{
 const b=bookById(value?.book),unit=Number(value?.unit),step=Number(value?.startLesson||1);
 if(!b||bookFamily(b.id)!==family||!Number.isInteger(unit)||unit<1||unit>b.units.length||!Number.isInteger(step)||step<1||step>requiredLessons(b.id,unit).length)throw new AppError(`Choose your ${family==='navigate'?'Navigate':'Essential'} book, Unit and ${family==='navigate'?'lesson':'word'}.`);
 return {book:b.id,unlockedUnit:unit,startUnit:unit,startLesson:step};
}
export function selectedTracks(data:any):StudyTracks{return {navigate:selectedTrack(data?.navigate,'navigate'),essential:selectedTrack(data?.essential,'essential')};}
export function trackFields(tracks:StudyTracks){const main=tracks.navigate;return {book_tracks:tracks,book:main.book,unlocked_unit:main.unlockedUnit,start_unit:main.startUnit,start_lesson:main.startLesson};}
export function updateSelection(old:StudyTrack,next:StudyTrack){const visibleStep=old.startUnit===old.unlockedUnit?old.startLesson:1;return old.book===next.book&&old.unlockedUnit===next.unlockedUnit&&visibleStep===next.startLesson?old:next;}
