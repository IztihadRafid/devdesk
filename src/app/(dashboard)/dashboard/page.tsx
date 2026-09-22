"use client";
import { FolderKanban, CircleDot, Loader, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
interface Stats {
  totalProjects: number;
  statusCounts: { _id: string; count: number }[];
  severityCounts: { _id: string; count: number }[];
  recentIssues: {
    _id: string;
    issueNumber: number;
    title: string;
    status: string;
    project: { _id: string; name: string; key: string };
  }[];
}

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#64748b",
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { data: session } = useSession();
  console.log(session);
  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      });
  }, []);

  if (!stats) return <p className="p-8">Loading...</p>;

  const totalIssues = stats.statusCounts.reduce((sum, s) => sum + s.count, 0);
  const openCount =
    stats.statusCounts.find((s) => s._id === "open")?.count || 0;
  const inProgressCount =
    stats.statusCounts.find((s) => s._id === "in_progress")?.count || 0;
  const resolvedCount =
    stats.statusCounts.find((s) => s._id === "resolved")?.count || 0;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-medium">{session.user.name}</p>
              <p className="text-muted-foreground text-md">
                {session.user.email}
              </p>
            </div>
            {session?.user.image && (
              <img
                src={session.user.image}
                alt={session?.user.name || "User"}
                className="h-9 w-9 rounded-full"
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-muted-foreground text-sm">Projects</p>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
            </div>
            <FolderKanban className="text-muted-foreground/50 h-8 w-8" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-muted-foreground text-sm">Open Issues</p>
              <p className="text-2xl font-bold">{openCount}</p>
            </div>
            <CircleDot className="h-8 w-8 text-red-500/50" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-muted-foreground text-sm">In Progress</p>
              <p className="text-2xl font-bold">{inProgressCount}</p>
            </div>
            <Loader className="h-8 w-8 text-yellow-500/50" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-muted-foreground text-sm">Resolved</p>
              <p className="text-2xl font-bold">{resolvedCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500/50" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {totalIssues === 0 ? (
              <p className="text-muted-foreground text-sm">No issues yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.statusCounts}
                    dataKey="count"
                    nameKey="_id"
                    outerRadius={80}
                  >
                    {stats.statusCounts.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            {totalIssues === 0 ? (
              <p className="text-muted-foreground text-sm">No issues yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.severityCounts}>
                  <XAxis dataKey="_id" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recently updated issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.recentIssues.length === 0 && (
            <p className="text-muted-foreground text-sm">No issues yet.</p>
          )}
          {stats.recentIssues.map((issue) => (
            <Link key={issue._id} href={`/issues/${issue._id}`}>
              <div className="hover:bg-accent flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors">
                <span>
                  <span className="text-muted-foreground mr-2">
                    {issue.project.key}-{issue.issueNumber}
                  </span>
                  {issue.title}
                </span>
                <span className="text-muted-foreground">{issue.status}</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
