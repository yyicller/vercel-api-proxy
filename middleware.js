const ALLOWED_DOMAINS = [

  'huggingface.co', 'hf.co',

  'reddit.com', 'www.reddit.com', 'old.reddit.com',

  'news.ycombinator.com',

  'google.com', 'www.google.com',

];



export default function middleware(request) {

  const url = new URL(request.url);

  

  if (url.pathname === '/' || url.pathname.startsWith('/img/')) {

    return Response.next();

  }



  const match = url.pathname.match(/^\/(https?|wss)\/([^\/]+)/);

  if (match) {

    const targetHost = match[2];

    const allowed = ALLOWED_DOMAINS.some(

      d => targetHost === d || targetHost.endsWith('.' + d)

    );

    if (!allowed) {

      return new Response(`Domain ${targetHost} is not allowed`, { status: 403 });

    }

  }



  return Response.next();

}



export const config = {

  matcher: ['/:path*'],

};

