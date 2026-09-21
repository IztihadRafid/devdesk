import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import Comment from "@/models/Comment";
import { getUserProjectRole, hasPermission } from "@/lib/authz";
import { notify } from "@/lib/services/activity.service";

const createCommentSchema = z.object({
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
  await connectDB();

  const issue = await Issue.findById(id);
  if (!issue) {
    return NextResponse.json({ success: false, message: "Issue not found" }, { status: 404 });
  }

  const role = await getUserProjectRole(session.user.id, issue.project.toString());
  if (!hasPermission(role, "viewProject")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const comments = await Comment.find({ issue: id })
    .populate("author", "name email")
    .sort({ createdAt: 1 });

  return NextResponse.json({ success: true, comments });
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
  await connectDB();

  const issue = await Issue.findById(id);
  if (!issue) {
    return NextResponse.json({ success: false, message: "Issue not found" }, { status: 404 });
  }

  // anyone who can view the project can comment — matches your spec (all roles except Viewer can chat/comment)
  const role = await getUserProjectRole(session.user.id, issue.project.toString());
  if (!role || role === "viewer") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

   const comment = await Comment.create({
    issue: id,
    author: session.user.id,
    content: parsed.data.content,
  });

  await comment.populate("author", "name email");

  // notify the issue's assignee and reporter (if they're not the commenter)
  const notifyTargets = new Set(
    [issue.assignee?.toString(), issue.reporter.toString()].filter(
      (uid) => uid && uid !== session.user.id
    )
  );

  for (const uid of notifyTargets) {
    await notify({
      recipient: uid as string,
      type: "new_comment",
      message: `New comment on issue "${issue.title}"`,
      relatedEntity: { type: "issue", id: issue._id.toString() },
    });
  }

  return NextResponse.json({ success: true, comment });
}