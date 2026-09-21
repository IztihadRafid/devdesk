import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const notification = await Notification.findOne({ _id: id, recipient: session.user.id });
  if (!notification) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  notification.isRead = true;
  await notification.save();

  return NextResponse.json({ success: true, notification });
}