import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { getUserProjectRole, hasPermission } from "@/lib/authz";
import { Types } from "mongoose";

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "developer", "tester", "viewer"]),
});

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

  if (!hasPermission(role, "manageMembers")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const userToAdd = await User.findOne({ email: parsed.data.email });
  if (!userToAdd) {
    return NextResponse.json(
      { success: false, message: "No user found with that email" },
      { status: 404 }
    );
  }

  const project = await Project.findById(id);
  if (!project) {
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
  }

  const alreadyMember = project.members.some(
  (m: { user: Types.ObjectId }) => m.user.toString() === userToAdd._id.toString()
);
  if (alreadyMember) {
    return NextResponse.json(
      { success: false, message: "User is already a member" },
      { status: 409 }
    );
  }

  project.members.push({ user: userToAdd._id, role: parsed.data.role });
  await project.save();

  return NextResponse.json({ success: true, project });
}