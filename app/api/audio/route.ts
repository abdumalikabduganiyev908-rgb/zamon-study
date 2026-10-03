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

    const path = track.path
      .split('/')
      .map(part => encodeURIComponent(part))
      .join('/');

    const requestHeaders = new Headers();

    for (const name of ['range', 'if-range']) {
      const value = req.headers.get(name);
      if (value) requestHeaders.set(name, value);
    }

    const response = await fetch(AUDIO_BASE + path, {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      headers: requestHeaders,
      cache: 'no-store',
    });

    if (!response.ok && response.status !== 416) {
      throw new AppError('Audio could not be loaded.', 502);
    }

    const headers = new Headers({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });

    for (const name of [
      'content-length',
      'content-range',
      'accept-ranges',
      'etag',
      'last-modified',
    ]) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }

    if (params.get('download') === '1') {
      const filename =
        `Zamon-${track.book}-${track.kind}` +
        `-Unit-${track.unit}-Track-${track.track}.mp3`;

      headers.set(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
    }

    return new Response(
      req.method === 'HEAD' ? null : response.body,
      {
        status: response.status,
        headers,
      },
    );
  } catch (error) {
    return fail(error);
  }
}

export const HEAD = GET;