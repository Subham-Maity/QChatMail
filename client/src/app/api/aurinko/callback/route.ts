import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const code = params.get("code");

  if (!code) {
    return NextResponse.json(
      { message: "Invalid Request" },
      {
        status: 400,
      },
    );
  }

  try {
    // Call NestJS backend route to exchange the code for a token
    const response = await axios.post(
      `http://localhost:3333/Q/aurinko/callback`,
      { code },
    );
    console.log("Token Response:", response.data);

    return NextResponse.json(response.data, {
      status: 200,
    });
  } catch (error) {
    console.error("Error exchanging token:", error);

    return NextResponse.json(
      { message: "Token exchange failed" },
      {
        status: 500,
      },
    );
  }
};
