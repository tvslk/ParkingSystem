import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

// Token cache with expiration tracking
let tokenCache: {
  access_token: string;
  expires_at: number; // Timestamp when token expires
} | null = null;

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Check cache first
    const now = Date.now();
    if (tokenCache && tokenCache.expires_at > now + 60000) { // 1 minute buffer
      return NextResponse.json({ success: true });
    }
    
    // Get fresh token
    const tokenResponse = await fetch('https://dev-xo2a73yt4ois67tv.us.auth0.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_M2M_CLIENT_ID,
        client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
        audience: "https://dev-xo2a73yt4ois67tv.us.auth0.com/api/v2/",
        grant_type: "client_credentials"
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token request failed:', await tokenResponse.text());
      return NextResponse.json({ error: 'Failed to obtain token' }, { status: 500 });
    }

    const data = await tokenResponse.json();
    
    // Cache token with expiration
    tokenCache = {
      access_token: data.access_token,
      expires_at: now + (data.expires_in * 1000) // Convert seconds to milliseconds
    };
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in token endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}