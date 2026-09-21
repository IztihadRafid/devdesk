import { NextResponse } from "next/server";
import { z } from "zod";
import Ably from "ably";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { getUserProjectRole } from "@/lib/authz";

const sendMessageSchema = z.object({
  content: z.string().min(1),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const role = await getUserProjectRole(session.user.id, id);
  if (!role) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const messages = await Message.find({ project: id })
    .populate("sender", "name email")
    .sort({ createdAt: 1 })
    .limit(50);

  return NextResponse.json({ success: true, messages });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const role = await getUserProjectRole(session.user.id, id);
  if (!role || role === "viewer") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const message = await Message.create({
    project: id,
    sender: session.user.id,
    content: parsed.data.content,
  });

  await message.populate("sender", "name email");

  
  const ably = new Ably.Rest(process.env.ABLY_API_KEY as string);
  const channel = ably.channels.get(`project:${id}`);
  await channel.publish("new-message", message);

  return NextResponse.json({ success: true, message });
}