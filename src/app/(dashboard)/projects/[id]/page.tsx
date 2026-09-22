"use client";
import { StatusBadge } from "@/components/status-badge";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bug } from "lucide-react";
interface Member {
  user: { _id: string; name: string; email: string };
  role: string;
}

interface Project {
  _id: string;
  name: string;
  key: string;
  description?: string;
  members: Member[];
}

interface Issue {
  _id: string;
  issueNumber: number;
  title: string;
  status: string;
  priority: string;
  severity: string;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [email, setEmail] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [error, setError] = useState("");
  const [issueError, setIssueError] = useState("");

  async function loadProject() {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    if (data.success) setProject(data.project);
  }

  async function loadIssues() {
    const res = await fetch(`/api/projects/${id}/issues`);
    const data = await res.json();
    if (data.success) setIssues(data.issues);
  }

  useEffect(() => {
    loadProject();
    loadIssues();
  }, [id]);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/projects/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: "developer" }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message);
      return;
    }
    setEmail("");
    loadProject();
  }

  async function handleCreateIssue(e: React.FormEvent) {
    e.preventDefault();
    setIssueError("");
    const res = await fetch(`/api/projects/${id}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: issueTitle }),
    });
    const data = await res.json();
    if (!data.success) {
      setIssueError(data.message);
      return;
    }
    setIssueTitle("");
    loadIssues();
  }

  if (!project) return <p className="p-8">Loading...</p>;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">
        {project.name}{" "}
        <span className="text-muted-foreground text-lg">({project.key})</span>
      </h1>
      <Link
        href={`/projects/${id}/chat`}
        className="text-sm text-blue-500 hover:underline"
      >
        Open chat →
      </Link>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {project.members.map((m) => (
            <div key={m.user._id} className="flex justify-between text-sm">
              <span>{m.user.name || m.user.email}</span>
              <span className="text-muted-foreground">{m.role}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Add member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMember} className="flex gap-2">
            <Input
              type="email"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">Add</Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>New issue</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateIssue} className="flex gap-2">
            <Input
              placeholder="Issue title"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              required
            />
            <Button type="submit">Create</Button>
          </form>
          {issueError && (
            <p className="mt-2 text-sm text-red-500">{issueError}</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 space-y-2">
        {issues.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
            <Bug className="text-muted-foreground/40 h-8 w-8" />
            <p className="text-muted-foreground mt-2 text-sm">
              No issues yet. Create the first one above.
            </p>
          </div>
        )}
        {issues.map((issue) => (
          <Link key={issue._id} href={`/issues/${issue._id}`}>
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="flex items-center justify-between py-3">
                <span>
                  <span className="text-muted-foreground mr-2">
                    {project.key}-{issue.issueNumber}
                  </span>
                  {issue.title}
                </span>
                <StatusBadge status={issue.status} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
