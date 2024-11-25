import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, code_verifier } = req.body;

  if (!code || !code_verifier) {
    return res.status(400).json({ error: "Code and code_verifier are required" });
  }

  try {
    localStorage.setItem('code-verifier', code_verifier);
    const tokenResponse = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
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
      return res.status(tokenResponse.status).json(error);
    }

    const data = await tokenResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Token exchange error:", error);
    res.status(500).json({ error: "Failed to exchange token" });
  }
}