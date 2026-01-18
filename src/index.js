export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Change "*" to your specific domain for security
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    };

    // 1. Handle CORS Preflight (OPTIONS request)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // 2. Parse the target URL
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Usage: ?url=https://target-api.com", { status: 400 });
    }

    // 3. Prepare the new request
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow"
    });

    try {
      const response = await fetch(newRequest);

      // 4. Reconstruct response with CORS headers
      const newResponse = new Response(response.body, response);
      Object.keys(corsHeaders).forEach((key) => {
        newResponse.headers.set(key, corsHeaders[key]);
      });

      return newResponse;

    } catch (e) {
      return new Response(`Proxy Error: ${e.message}`, { status: 500 });
    }
  },
};
