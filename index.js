const ORIGIN_URL = "https://github.com/ProtonAOSP";

// 2 months, in seconds
const CACHE_TTL = 5259488;

// Regex patterns for allowed CORS origins
const CORS_ALLOWED_ORIGINS = [
  /^protonaosp\.kdrag0n\.dev$/,
  /^android-webinstall-kdrag0n\.vercel\.app$/,
  /^android-webinstall-git-[a-z0-9\-_/]-kdrag0n\.vercel\.app$/,
  /^android-webinstall-[a-z0-9]+-kdrag0n\.vercel\.app$/,
];

addEventListener('fetch', function(event) {
  let resp = handleRequest(event.request);
  return event.respondWith(resp);
});

function validateCors(origin) {
  let originUrl = new URL(origin);
  for (let pattern of CORS_ALLOWED_ORIGINS) {
    if (pattern.test(originUrl.host)) {
      return true;
    }
  }

  return false;
}

function parseRequest(request) {
  if (request.method !== "GET") {
    throw new Error("Invalid request method");
  }

  // Validate CORS, if necessary
  let origin = request.headers.get("Origin")
  if (origin !== null && !validateCors(origin)) {
    throw new Error("Origin not allowed");
  }

  let reqUrl = new URL(request.url);
  let reqParts = reqUrl.pathname.split("/").slice(1);
  // repo, tag, filename
  if (reqParts.length !== 3) {
    throw new Error("Invalid request URL");
  }

  let [repo, tag, filename] = reqParts;
  return {
    url: `${ORIGIN_URL}/${repo}/releases/download/${tag}/${filename}`,
    corsOrigin: origin,
  };
}

async function handleRequest(request) {
  let { url, corsOrigin } = parseRequest(request);
  let originResp = await fetch(url, {
    cf: {
      // 2 months
      cacheTtl: CACHE_TTL,
      cacheEverything: true,
    },
  });

  // Copy response and modify headers
  let clientResp = new Response(originResp.body, originResp);
  clientResp.headers.set("Cache-Control", `public, max-age=${CACHE_TTL}`);
  if (corsOrigin !== null) {
    clientResp.headers.set("Access-Control-Allow-Origin", corsOrigin);
  }

  return clientResp;
}
