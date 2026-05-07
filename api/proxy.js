const ALLOWED_DOMAINS = [

  'huggingface.co', 'hf.co',

  'reddit.com', 'www.reddit.com', 'old.reddit.com',

  'news.ycombinator.com',

  'google.com', 'www.google.com',

];



export default async function handler(request, response) {

  const url = new URL(request.url, `http://${request.headers.host}`);

  const pathname = url.pathname;



  if (pathname === '/' || pathname === '') {

    response.status(200).send('Proxy running. Use /https/domain.com/path');

    return;

  }



  const match = pathname.match(/^\/(https?)\/([^\/]+)(\/.*)?$/);

  if (!match) {

    response.status(400).send('Invalid path');

    return;

  }



  const protocol = match[1];

  const targetHost = match[2];

  const targetPath = match[3] || '/';



  const allowed = ALLOWED_DOMAINS.some(

    d => targetHost === d || targetHost.endsWith('.' + d)

  );

  if (!allowed) {

    response.status(403).send(`Domain ${targetHost} not allowed`);

    return;

  }



  const targetUrl = `${protocol}://${targetHost}${targetPath}${url.search}`;



  try {

    const proxyResponse = await fetch(targetUrl, {

      method: request.method,

      headers: request.headers,

      body: ['GET', 'HEAD'].includes(request.method) ? null : JSON.stringify(request.body),

    });



    response.status(proxyResponse.status);

    proxyResponse.headers.forEach((value, key) => {

      response.setHeader(key, value);

    });

    const text = await proxyResponse.text();

    response.send(text);

  } catch (err) {

    response.status(502).send(`Proxy error: ${err.message}`);

  }

}

