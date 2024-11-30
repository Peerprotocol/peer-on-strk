// app/api/auth/twitter/route.ts
import { NextResponse } from 'next/server';

// app/api/auth/route.ts
export async function POST(request: Request) {
  try {
    const { code, code_verifier } = await request.json();

    // Get access token
    const tokenResponse = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: process.env.REDIRECT_URI!,
          code_verifier: code_verifier,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      return NextResponse.json(error, { status: tokenResponse.status });
    }

    const tokenData = await tokenResponse.json();
    
    // Get user data
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: userResponse.status }
      );
    }
    
    const userData = await userResponse.json();
    
    return NextResponse.json({
      access_token: tokenData.access_token,
      user: userData.data
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}