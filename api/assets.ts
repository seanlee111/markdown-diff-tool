import { createClient } from '@vercel/kv';

// Switch to Node.js runtime for better compatibility and logging
// Edge runtime can sometimes have issues with specific Redis clients or connection pooling
export const config = {
  runtime: 'nodejs',
};

export default async function handler(request, response) {
  // In Node.js runtime, we use (req, res) signature, but Vercel also supports standard Request/Response if we use specific helpers.
  // However, standard Vercel Serverless Functions use (req, res).
  // Let's use the standard Node.js style (req, res) for maximum reliability.
  
  const { method } = request;
  const url = new URL(request.url, `http://${request.headers.host}`);

  // Initialize KV client with fallback for generic Redis/Upstash env vars
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  console.log(`[API] ${method} ${url.pathname} - Connecting to KV...`);

  if (!kvUrl || !kvToken) {
    console.error('[API] Missing Vercel KV/Redis environment variables');
    return response.status(500).json({ 
        error: 'Server Misconfiguration: Missing Redis credentials. Please check Vercel Storage settings.' 
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
      console.log('[API] Fetch assets success');
      const result = assets ? Object.values(assets) : [];
      return response.status(200).json(result);
    }

    if (method === 'POST') {
      const body = request.body; // Vercel automatically parses JSON body
      const { id, name, content } = body;
      
      if (!id || !name || !content) {
        console.warn('[API] POST missing fields');
        return response.status(400).json({ error: 'Missing fields' });
      }
      
      // Store in Hash: assets, field: id, value: body
      await kv.hset('assets', { [id]: body });
      console.log(`[API] Saved asset ${id}`);
      
      return response.status(200).json(body);
    }

    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) {
        return response.status(400).json({ error: 'Missing id' });
      }
      
      await kv.hdel('assets', id);
      console.log(`[API] Deleted asset ${id}`);
      
      return response.status(200).json({ success: true });
    }

    return response.status(405).send('Method not allowed');
  } catch (error) {
    console.error('[API] Error:', error);
    return response.status(500).json({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error) 
    });
  }
}
