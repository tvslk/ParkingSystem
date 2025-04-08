import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { createAccessToken } from '@/actions/createAccessToken';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const accessToken = await createAccessToken();
    const userId = params.id;

    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Auth0 API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch user from Auth0" },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}