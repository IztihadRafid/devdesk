import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // block deletion if they still own any project — must delete/transfer first
  const ownedProjects = await Project.find({ owner: session.user.id }).select("name");
  if (ownedProjects.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `You still own ${ownedProjects.length} project(s). Delete or transfer ownership before deleting your account.`,
        projects: ownedProjects.map((p) => p.name),
      },
      { status: 400 }
    );
  }

  // remove from all project memberships they're part of (as non-owner)
  await Project.updateMany(
    { "members.user": session.user.id },
    { $pull: { members: { user: session.user.id } } }
  );

  // delete — keep the document so historical issues/comments still resolve
  await User.findByIdAndUpdate(session.user.id, {
    isDeleted: true,
    name: "Deleted User",
    email: `deleted-${session.user.id}@devdesk.invalid`,
    passwordHash: undefined,
    image: undefined,
  });

  return NextResponse.json({ success: true });
}