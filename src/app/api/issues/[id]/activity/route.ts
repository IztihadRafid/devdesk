import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import Activity from "@/models/Activity";
import { getUserProjectRole, hasPermission } from "@/lib/authz";

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
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const role = await getUserProjectRole(session.user.id, issue.project.toString());
  if (!hasPermission(role, "viewProject")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const activity = await Activity.find({ entityType: "issue", entityId: id })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, activity });
}