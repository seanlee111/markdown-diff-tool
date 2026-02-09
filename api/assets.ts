import { createClient } from '@vercel/kv';
import Redis from 'ioredis';

// Switch to Node.js runtime for better compatibility and logging
export const config = {
  runtime: 'nodejs',
};

export default async function handler(request, response) {
  const { method } = request;
  const url = new URL(request.url, `http://${request.headers.host}`);

  console.log(`[API] ${method} ${url.pathname} - Initializing DB connection...`);

  // Strategy 1: Try Vercel KV / Upstash HTTP API (Preferred for Serverless)
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // Strategy 2: Try Standard Redis URL (ioredis)
  const redisUrl = process.env.REDIS_URL;

  let dbClient = null;
  let dbType = 'none';

  if (kvUrl && kvToken) {
      console.log('[API] Using Vercel KV / Upstash HTTP');
      dbType = 'kv';
      dbClient = createClient({
        url: kvUrl,
        token: kvToken,
      });
  } else if (redisUrl) {
      console.log('[API] Using Standard Redis URL (ioredis)');
      dbType = 'redis';
      try {
          dbClient = new Redis(redisUrl);
      } catch (e) {
          console.error('[API] Failed to initialize ioredis:', e);
      }
  } else {
      console.error('[API] No valid database credentials found.');
      console.error('Checked env vars: KV_REST_API_URL, UPSTASH_REDIS_REST_URL, REDIS_URL');
      return response.status(500).json({ 
        error: 'Server Misconfiguration: Missing Redis credentials.',
        details: 'Please set REDIS_URL or KV_REST_API_URL in Vercel settings.'
      });
  }

  try {
    if (method === 'GET') {
      let result = [];
      
      if (dbType === 'kv') {
          const assets = await dbClient.hgetall('assets');
          result = assets ? Object.values(assets) : [];
      } else if (dbType === 'redis') {
          const assets = await dbClient.hgetall('assets');
          // ioredis hgetall returns object directly
          result = assets ? Object.values(assets).map(item => typeof item === 'string' ? JSON.parse(item) : item) : [];
      }

      console.log(`[API] Fetch assets success (${result.length} items)`);
      return response.status(200).json(result);
    }

    if (method === 'POST') {
      const body = request.body;
      const { id, name, content } = body;
      
      if (!id || !name || !content) {
        return response.status(400).json({ error: 'Missing fields' });
      }
      
      const valueToStore = dbType === 'redis' ? JSON.stringify(body) : body;
      
      if (dbType === 'kv') {
          await dbClient.hset('assets', { [id]: valueToStore });
      } else if (dbType === 'redis') {
          await dbClient.hset('assets', id, valueToStore);
      }

      console.log(`[API] Saved asset ${id}`);
      return response.status(200).json(body);
    }

    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return response.status(400).json({ error: 'Missing id' });
      
      await dbClient.hdel('assets', id);
      console.log(`[API] Deleted asset ${id}`);
      return response.status(200).json({ success: true });
    }

    // Cleanup ioredis connection if needed (though in serverless it might be reused)
    if (dbType === 'redis') {
        // dbClient.quit(); // Don't quit immediately in serverless to allow reuse? 
        // Actually for Vercel functions, better to let it handle connection or quit.
        // For safety/simplicity in this fix:
        await dbClient.quit();
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
