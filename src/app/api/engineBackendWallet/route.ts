import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const engineApiUrl = process.env.ACCESS_TOKEN;
    const accessToken = process.env.ENGINE_URL;

    if (!engineApiUrl || !accessToken) {
      return NextResponse.json(
        { error: "Engine API URL or Access Token not configured" },
        { status: 500 }
      );
    }

    // Create a smart:local backend wallet
    const response = await fetch(`${engineApiUrl}/backend-wallet/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: "smart:local" // Creates a smart backend wallet with local signer
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to create smart backend wallet", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error creating smart backend wallet:", error);
    return NextResponse.json(
      { error: "Failed to create smart backend wallet" },
      { status: 500 }
    );
  }
} 