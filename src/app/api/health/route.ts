import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Try to reach the target URL with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(targetUrl, {
      method: 'GET', // Using GET to ensure it's actually responding
      mode: 'no-cors',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Portal-Health-Check'
      }
    });

    clearTimeout(timeoutId);

    // If it responds at all (even 4xx/5xx in some cases), it's "online"
    // But we prefer a successful status code if possible
    return NextResponse.json({ 
      status: response.status >= 200 && response.status < 400 ? 'online' : 'unreachable',
      code: response.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Health check failed for ${targetUrl}:`, error);
    return NextResponse.json({ 
      status: 'offline', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 200 }); // We return 200 so the component gets the JSON
  }
}
