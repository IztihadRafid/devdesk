import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getUserProjectRole, hasPermission } from "@/lib/authz";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id, userId } = await params;
  const role = await getUserProjectRole(session.user.id, id);

  if (!hasPermission(role, "manageMembers")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const project = await Project.findById(id);
  if (!project) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  
  if (project.owner.toString() === userId) {
    return NextResponse.json(
      { success: false, message: "Cannot remove the project owner" },
      { status: 400 }
    );
  }

  project.members = project.members.filter((m) => m.user.toString() !== userId);
  await project.save();

  return NextResponse.json({ success: true });
}