export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // CAUTION: Allows any domain. See security note below.
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    };

    // 1. Handle CORS Preflight (OPTIONS request)
    // Browsers send this first to check if they are allowed to access the API.
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // 2. Parse the target URL
    // Usage: https://your-worker.workers.dev/?url=https://api.example.com
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Usage: ?url=https://target-api.com", { status: 400 });
    }

    // 3. Prepare the new request
    // We create a new Request object because the original request is immutable.
    // We strip specific headers (like Host) that Cloudflare or the target might object to.
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow"
    });

    try {
      // 4. Fetch data from the target
      const response = await fetch(newRequest);

      // 5. Reconstruct the response with CORS headers
      // We must create a new Response object to modify the headers.
      const newResponse = new Response(response.body, response);

      // Inject the CORS headers into the response
      Object.keys(corsHeaders).forEach((key) => {
        newResponse.headers.set(key, corsHeaders[key]);
      });

      return newResponse;

    } catch (e) {
      return new Response(`Error fetching ${targetUrl}: ${e.message}`, { status: 500 });
    }
  },
};
