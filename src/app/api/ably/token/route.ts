import { NextResponse } from "next/server";
import Ably from "ably";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const ably = new Ably.Rest(process.env.ABLY_API_KEY as string);

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: session.user.id,
  });

  return NextResponse.json(tokenRequest);
}