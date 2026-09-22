import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";

const updateCommentSchema = z.object({
  content: z.string().min(1),
});

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

  const comment = await Comment.findById(id);
  if (!comment) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  // only the author can edit their own comment
  if (comment.author.toString() !== session.user.id) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  comment.content = parsed.data.content;
  await comment.save();
  await comment.populate("author", "name email");

  return NextResponse.json({ success: true, comment });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const comment = await Comment.findById(id);
  if (!comment) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  if (comment.author.toString() !== session.user.id) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  await Comment.deleteOne({ _id: id });

  return NextResponse.json({ success: true });
}