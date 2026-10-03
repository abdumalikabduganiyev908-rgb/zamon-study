import type {User,StudyTrack,StudyTracks} from './school-types';
export function bookFamily(book:string):'essential'|'navigate'{return /^essential(?:-[2-6])?$/.test(book)?'essential':'navigate';}
const first=(book:string):StudyTrack=>({book,unlockedUnit:1,startUnit:1,startLesson:1});
export function tracksFromRow(row:any):StudyTracks{
 const legacy:StudyTrack={book:row.book||'a1',unlockedUnit:row.unlocked_unit||1,startUnit:row.start_unit||1,startLesson:row.start_lesson||1};
 const result:StudyTracks={navigate:first('a1'),essential:first('essential')};
 result[bookFamily(legacy.book)]=legacy;
 for(const family of ['navigate','essential'] as const){const saved=row.book_tracks?.[family];if(saved&&typeof saved.book==='string'&&bookFamily(saved.book)===family&&Number.isInteger(saved.unlockedUnit)&&saved.unlockedUnit>0&&Number.isInteger(saved.startUnit)&&saved.startUnit>0&&saved.startUnit<=saved.unlockedUnit&&Number.isInteger(saved.startLesson)&&saved.startLesson>0)result[family]={book:saved.book,unlockedUnit:saved.unlockedUnit,startUnit:saved.startUnit,startLesson:saved.startLesson};}
 return result;
}
export function userTracks(user?:Pick<User,'book'|'unlockedUnit'|'startUnit'|'startLesson'|'courses'>|null):StudyTracks{return user?.courses||tracksFromRow({book:user?.book,unlocked_unit:user?.unlockedUnit,start_unit:user?.startUnit,start_lesson:user?.startLesson});}
export function courseFor(user:Parameters<typeof userTracks>[0],book:string):StudyTrack|undefined{const track=userTracks(user)[bookFamily(book)];return track.book===book?track:undefined;}
export function trackAllowed(user:Parameters<typeof userTracks>[0],book:string,unit:number){const c=courseFor(user,book);return !!c&&Number.isInteger(unit)&&unit>=1&&unit<=c.unlockedUnit;}
