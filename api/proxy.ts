import type { NextRequest } from 'next/server';



const ALLOWED_DOMAINS = [

  'huggingface.co', 'hf.co',

  'reddit.com', 'www.reddit.com', 'old.reddit.com',

  'news.ycombinator.com',

  'google.com', 'www.google.com',

];



export const config = { runtime: 'edge' };



export default async function handler(request: NextRequest) {

  const url = new URL(request.url);

  const pathname = url.pathname;



  if (pathname === '/' || pathname === '') {

    return new Response('Proxy running. Use /https/domain.com/path', {

      status: 200, headers: { 'content-type': 'text/plain' },

    });

  }



  const match = pathname.match(/^\/(https?)\/([^\/]+)(\/.*)?$/);

  if (!match) return new Response('Invalid path', { status: 400 });



  const protocol = match[1];

  const targetHost = match[2];

  const targetPath = match[3] || '/';



  const allowed = ALLOWED_DOMAINS.some(

    d => targetHost === d || targetHost.endsWith('.' + d)

  );

  if (!allowed) return new Response('Not allowed', { status: 403 });



  const targetUrl = `${protocol}://${targetHost}${targetPath}${url.search}`;

  try {

    const response = await fetch(targetUrl, {

      method: request.method,

      headers: request.headers,

      body: ['GET','HEAD'].includes(request.method) ? null : request.body,

    });

    return new Response(response.body, {

      status: response.status, statusText: response.statusText, headers: response.headers,

    });

  } catch (err) {

    return new Response(`Proxy error: ${err.message}`, { status: 502 });

  }

}

