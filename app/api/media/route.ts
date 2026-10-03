import {current,fail,AppError,permitted} from '@/lib/school-server';
// @ts-ignore shared Node adapter
import {signedAudio} from '@/scripts/firebase-store.mjs';
// @ts-ignore local audio is only served during local development
import {localAudioFile} from '@/scripts/local-audio.mjs';
import audio from '@/lib/data/audio-catalog.json';
export const runtime='nodejs';
export async function GET(req:Request){try{const u=await current(req);const params=new URL(req.url).searchParams,path=params.get('path'),download=params.get('download')==='1';const track=audio.find(x=>x.path===path);if(!track||!permitted(u,track.book,track.unit))throw new AppError('Audio not available.',403);if(await localAudioFile(track.path))return Response.json({url:'/api/audio?path='+encodeURIComponent(track.path)+(download?'&download=1':''),source:'local'},{headers:{'Cache-Control':'no-store'}});let url;try{url=await signedAudio(track.path,download)}catch{throw new AppError('Audio is not uploaded to Firebase Storage yet. During local development, check the media/audio folder.',503)}return Response.json({url},{headers:{'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
