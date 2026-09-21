import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const notifications = await Notification.find({ recipient: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20);

  return NextResponse.json({ success: true, notifications });
}