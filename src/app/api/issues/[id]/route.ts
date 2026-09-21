import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import { getUserProjectRole, hasPermission } from "@/lib/authz";
import { logActivity, notify } from "@/lib/services/activity.service";
const updateIssueSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["open", "in_progress", "testing", "resolved", "closed", "reopened"]).optional(),
  priority: z.enum(["urgent", "high", "medium", "low"]).optional(),
  severity: z.enum(["critical", "high", "medium", "low"]).optional(),
  assignee: z.string().optional(),
  labels: z.array(z.string()).optional(),
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

  const issue = await Issue.findById(id)
    .populate("reporter", "name email")
    .populate("assignee", "name email");

  if (!issue) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const role = await getUserProjectRole(session.user.id, issue.project.toString());
  if (!hasPermission(role, "viewProject")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ success: true, issue });
}

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

  const issue = await Issue.findById(id);
  if (!issue) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const role = await getUserProjectRole(session.user.id, issue.project.toString());
  const isAssignedToMe = issue.assignee?.toString() === session.user.id;

  const canEditFully = hasPermission(role, "editAnyIssue");
  const canEditAsAssignee = hasPermission(role, "editOwnAssignedIssue") && isAssignedToMe;

  if (!canEditFully && !canEditAsAssignee) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateIssueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  // Developers/Testers editing their own assigned issue can only change status, not reassign/reprioritize
  if (!canEditFully && canEditAsAssignee) {
    const allowedFields = ["status"];
    const attemptedFields = Object.keys(parsed.data);
    const disallowed = attemptedFields.filter((f) => !allowedFields.includes(f));
    if (disallowed.length > 0) {
      return NextResponse.json(
        { success: false, message: "You can only update status on this issue" },
        { status: 403 }
      );
    }
  }

    const previousStatus = issue.status;
  const previousAssignee = issue.assignee?.toString();

  Object.assign(issue, parsed.data);
  if (parsed.data.status === "resolved" && !issue.resolvedAt) {
    issue.resolvedAt = new Date();
  }
  await issue.save();

  // log activity for status change
  if (parsed.data.status && parsed.data.status !== previousStatus) {
    await logActivity({
      project: issue.project.toString(),
      user: session.user.id,
      action: `changed status from ${previousStatus} to ${parsed.data.status}`,
      entityType: "issue",
      entityId: issue._id.toString(),
    });

    // notify the assignee (if there is one, and they're not the one making the change)
    if (issue.assignee && issue.assignee.toString() !== session.user.id) {
      await notify({
        recipient: issue.assignee.toString(),
        type: "issue_status_changed",
        message: `Issue "${issue.title}" status changed to ${parsed.data.status}`,
        relatedEntity: { type: "issue", id: issue._id.toString() },
      });
    }
  }

  // log activity + notify on new assignment
  if (parsed.data.assignee && parsed.data.assignee !== previousAssignee) {
    await logActivity({
      project: issue.project.toString(),
      user: session.user.id,
      action: `assigned issue to a team member`,
      entityType: "issue",
      entityId: issue._id.toString(),
    });

    await notify({
      recipient: parsed.data.assignee,
      type: "issue_assigned",
      message: `You were assigned to issue "${issue.title}"`,
      relatedEntity: { type: "issue", id: issue._id.toString() },
    });
  }

  return NextResponse.json({ success: true, issue });
}