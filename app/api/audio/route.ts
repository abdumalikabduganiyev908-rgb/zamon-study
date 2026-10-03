import {current,fail,AppError,permitted} from '@/lib/school-server';
import audio from '@/lib/data/audio-catalog.json';
// @ts-ignore shared Node streaming helper
import {localAudioFile,audioResponse} from '@/scripts/local-audio.mjs';
export const runtime='nodejs';
export async function GET(req:Request){try{const u=await current(req),params=new URL(req.url).searchParams;const track=audio.find(x=>x.path===params.get('path'));if(!track||!permitted(u,track.book,track.unit))throw new AppError('Audio not available.',403);const file=await localAudioFile(track.path);if(!file)throw new AppError('Local audio is not available. Upload the audio to Firebase Storage for the deployed site.',404);return audioResponse(req,file,`Zamon-${track.book}-${track.kind}-Unit-${track.unit}-Track-${track.track}.mp3`,params.get('download')==='1')}catch(e){return fail(e)}}
export const HEAD=GET;
