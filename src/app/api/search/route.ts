import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Issue from "@/models/Issue";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, projects: [], issues: [] });
  }

  await connectDB();

  const myProjects = await Project.find({ "members.user": session.user.id }).select("_id");
  const projectIds = myProjects.map((p) => p._id);

  // escape regex special characters so user input can't break the pattern
  const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(safeQuery, "i"); // "i" = case-insensitive

  const [projects, issues] = await Promise.all([
    Project.find({
      _id: { $in: projectIds },
      name: regex,
    }).limit(5),
    Issue.find({
      project: { $in: projectIds },
      title: regex,
    })
      .populate("project", "key")
      .limit(10),
  ]);

  return NextResponse.json({ success: true, projects, issues });
}