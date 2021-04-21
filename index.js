const ORIGIN_URL = "https://github.com/ProtonAOSP";
// 2 months, in seconds
const CACHE_TTL = 5259488;

addEventListener('fetch', function(event) {
  let resp = handleRequest(event.request);
  return event.respondWith(resp);
});

function parseRequest(request) {
  let reqUrl = new URL(request.url);
  let reqParts = reqUrl.pathname.split("/").slice(1);
  // repo, tag, filename
  if (reqParts.length != 3) {
    throw new Error("Invalid request URL");
  }

  let [repo, tag, filename] = reqParts;
  return `${ORIGIN_URL}/${repo}/releases/download/${tag}/${filename}`;
}

async function handleRequest(request) {
  let originUrl = parseRequest(request);
  let originResp = await fetch(originUrl, {
    cf: {
      // 2 months
      cacheTtl: CACHE_TTL,
      cacheEverything: true,
    },
  });

  // Copy response and modify headers
  let clientResp = new Response(originResp.body, originResp);
  clientResp.headers.set("Cache-Control", `public, max-age=${CACHE_TTL}`);
  return clientResp;
}
