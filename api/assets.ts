import { createClient } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const method = request.method;

  // Initialize KV client with fallback for generic Redis/Upstash env vars
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    console.error('Missing Vercel KV/Redis environment variables');
    return new Response(JSON.stringify({ 
        error: 'Server Misconfiguration: Missing Redis credentials. Please check Vercel Storage settings.' 
    }), { 
        status: 500,
        headers: { 'content-type': 'application/json' }
    });
  }

  const kv = createClient({
    url: kvUrl,
    token: kvToken,
  });

  try {
    if (method === 'GET') {
      // Get all assets
      const assets = await kv.hgetall('assets');
      // kv.hgetall returns null if empty, or an object { key: value }
      const result = assets ? Object.values(assets) : [];
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (method === 'POST') {
      const body = await request.json();
      const { id, name, content } = body;
      
      if (!id || !name || !content) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), { 
            status: 400,
            headers: { 'content-type': 'application/json' }
        });
      }
      
      // Store in Hash: assets, field: id, value: body
      await kv.hset('assets', { [id]: body });
      
      return new Response(JSON.stringify(body), { 
          status: 200, 
          headers: { 'content-type': 'application/json' }
      });
    }

    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id' }), { 
            status: 400,
            headers: { 'content-type': 'application/json' }
        });
      }
      
      await kv.hdel('assets', id);
      
      return new Response(JSON.stringify({ success: true }), { 
          status: 200,
          headers: { 'content-type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
        status: 500,
        headers: { 'content-type': 'application/json' }
    });
  }
}
