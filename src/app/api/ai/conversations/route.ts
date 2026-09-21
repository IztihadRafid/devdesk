import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import AIConversation from "@/models/AIConversation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const conversations = await AIConversation.find({ user: session.user.id })
    .select("title createdAt updatedAt")
    .sort({ updatedAt: -1 });

  return NextResponse.json({ success: true, conversations });
}