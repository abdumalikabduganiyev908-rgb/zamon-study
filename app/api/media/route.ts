import {
  current,
  fail,
  AppError,
  permitted,
} from '@/lib/school-server';
import audio from '@/lib/data/audio-catalog.json';

export const runtime = 'nodejs';

const AUDIO_BASE = 'https://zamon-audio.pages.dev/';

export async function GET(req: Request) {
  try {
    const user = await current(req);
    const params = new URL(req.url).searchParams;
    const track = audio.find(
      item => item.path === params.get('path'),
    );

    if (!track || !permitted(user, track.book, track.unit)) {
      throw new AppError('Audio not available.', 403);
    }

    const download = params.get('download') === '1';

    const path = track.path
      .split('/')
      .map(part => encodeURIComponent(part))
      .join('/');

    const url = download
      ? '/api/audio?path=' +
        encodeURIComponent(track.path) +
        '&download=1'
      : AUDIO_BASE + path;

    return Response.json(
      { url, source: 'cloudflare' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return fail(error);
  }
}