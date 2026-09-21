import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

const createProjectSchema = z.object({
  name: z.string().min(2),
  key: z.string().min(2).max(10),
  description: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // only return projects this user is a member of
  const projects = await Project.find({ "members.user": session.user.id }).sort({
    createdAt: -1,
  });

  return NextResponse.json({ success: true, projects });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  const { name, key, description } = parsed.data;

  await connectDB();

  const existingKey = await Project.findOne({ key: key.toUpperCase() });
  if (existingKey) {
    return NextResponse.json(
      { success: false, message: "Project key already in use" },
      { status: 409 }
    );
  }

  const project = await Project.create({
    name,
    key: key.toUpperCase(),
    description,
    owner: session.user.id,
    members: [{ user: session.user.id, role: "owner" }],
  });

  return NextResponse.json({ success: true, project });
}