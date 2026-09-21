import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  await Notification.updateMany(
    { recipient: session.user.id, isRead: false },
    { isRead: true }
  );

  return NextResponse.json({ success: true });
}