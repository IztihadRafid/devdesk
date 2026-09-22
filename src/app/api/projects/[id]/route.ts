import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getUserProjectRole, hasPermission } from "@/lib/authz";
import Issue from "@/models/Issue";
import Message from "@/models/Message";
import Activity from "@/models/Activity";
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
  const project = await Project.findById(id).populate("members.user", "name email");

  if (!project) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, project });
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
  const role = await getUserProjectRole(session.user.id, id);

  if (!hasPermission(role, "manageProject")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  await connectDB();

 
  await Promise.all([
    Issue.deleteMany({ project: id }),
    Message.deleteMany({ project: id }),
    Activity.deleteMany({ project: id }),
    Project.findByIdAndDelete(id),
  ]);

  return NextResponse.json({ success: true });
}