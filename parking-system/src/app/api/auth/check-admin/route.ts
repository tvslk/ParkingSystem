import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

interface Role {
    id: string;
    name: string;
}

// Token cache (defined in the previous file)
let tokenCache: {
  access_token: string;
  expires_at: number;
} | null = null;

export async function GET() {
  try {
    // Get the user session
    const session = await getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' });
    }

    // Get or refresh management token
    if (!tokenCache || tokenCache.expires_at <= Date.now()) {
      const tokenResponse = await fetch('https://dev-xo2a73yt4ois67tv.us.auth0.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.AUTH0_M2M_CLIENT_ID || "dmRNDFs2vcTdXSi4Rj8qBNyXgyEGE7d4",  // Ideally use env vars
          client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,  // MUST use env var for security
          audience: "https://dev-xo2a73yt4ois67tv.us.auth0.com/api/v2/",
          grant_type: "client_credentials"
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Failed to get management token');
        return NextResponse.json({ isAdmin: false, error: 'Failed to authenticate with Auth0' });
      }

      const data = await tokenResponse.json();
      tokenCache = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in * 1000)
      };
    }

    // Use the token to check user roles
    const userResponse = await fetch(`https://dev-xo2a73yt4ois67tv.us.auth0.com/api/v2/users/${session.user.sub}/roles`, {
      headers: {
        Authorization: `Bearer ${tokenCache.access_token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user roles');
      return NextResponse.json({ isAdmin: false, error: 'Failed to fetch roles' });
    }

    const roles = await userResponse.json();
    
    // Find admin role (adapt this to match your actual admin role name or ID)
    const isAdmin = roles.some((role: Role) => 
      role.name === "admin" || role.id === process.env.NEXT_PUBLIC_ADMIN_ROLE_ID
    );

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false, error: 'Failed to check admin status' });
  }
}