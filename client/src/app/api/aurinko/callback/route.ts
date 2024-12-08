import { NextRequest, NextResponse } from "next/server";

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
  console.log(code + "code");

  return NextResponse.json({
    menubar: "Hello World!",
  });
};
