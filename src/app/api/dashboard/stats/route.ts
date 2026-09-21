import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Issue from "@/models/Issue";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const myProjects = await Project.find({ "members.user": session.user.id }).select("_id");
  const projectIds = myProjects.map((p) => p._id);

  const [totalProjects, statusCounts, severityCounts, recentIssues] = await Promise.all([
    Promise.resolve(myProjects.length),
    Issue.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Issue.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]),
    Issue.find({ project: { $in: projectIds } })
      .populate("project", "name key")
      .sort({ updatedAt: -1 })
      .limit(5),
  ]);

  return NextResponse.json({
    success: true,
    stats: {
      totalProjects,
      statusCounts, 
      severityCounts,
      recentIssues,
    },
  });
}