import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Issue from "@/models/Issue";
import { getUserProjectRole, hasPermission } from "@/lib/authz";

const createIssueSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["bug", "task", "feature", "improvement"]).default("bug"),
  priority: z.enum(["urgent", "high", "medium", "low"]).default("medium"),
  severity: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  labels: z.array(z.string()).optional(),
  environment: z.string().optional(),
  steps: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
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
  if (!hasPermission(role, "viewProject")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const issues = await Issue.find({ project: id })
    .populate("reporter", "name email")
    .populate("assignee", "name email")
    .sort({ issueNumber: -1 });

  return NextResponse.json({ success: true, issues });
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
  if (!hasPermission(role, "createIssue")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createIssueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const project = await Project.findByIdAndUpdate(
    id,
    { $inc: { issueCounter: 1 } },
    { new: true }
  );

  if (!project) {
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
  }

  const issue = await Issue.create({
    ...parsed.data,
    project: id,
    issueNumber: project.issueCounter,
    reporter: session.user.id,
  });

  return NextResponse.json({ success: true, issue });
}