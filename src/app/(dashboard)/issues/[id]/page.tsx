"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Issue {
  _id: string;
  issueNumber: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  severity: string;
  type: string;
  reporter: { name: string; email: string };
  assignee?: { name: string; email: string };
}

interface Comment {
  _id: string;
  content: string;
  author: { name: string; email: string };
  createdAt: string;
}
interface ActivityItem {
  _id: string;
  action: string;
  user: { name: string; email: string };
  createdAt: string;
}

const STATUSES = [
  "open",
  "in_progress",
  "testing",
  "resolved",
  "closed",
  "reopened",
];

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  async function loadIssue() {
    const res = await fetch(`/api/issues/${id}`);
    const data = await res.json();
    if (data.success) setIssue(data.issue);
    else setError(data.message);
  }

  async function loadComments() {
    const res = await fetch(`/api/issues/${id}/comments`);
    const data = await res.json();
    if (data.success) setComments(data.comments);
  }
  async function loadActivity() {
    const res = await fetch(`/api/issues/${id}/activity`);
    const data = await res.json();
    if (data.success) setActivity(data.activity);
  }
  useEffect(() => {
    loadIssue();
    loadComments();
    loadActivity();
  }, [id]);
  async function handleStatusChange(status: string) {
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message);
      return;
    }
    loadIssue();
    loadActivity();
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    setCommentError("");
    const res = await fetch(`/api/issues/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    const data = await res.json();
    if (!data.success) {
      setCommentError(data.message);
      return;
    }
    setNewComment("");
    loadComments();
  }

  if (error) return <p className="p-8 text-red-500">{error}</p>;
  if (!issue) return <p className="p-8">Loading...</p>;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">{issue.title}</h1>
      <p className="text-muted-foreground mt-1">
        Reported by {issue.reporter?.name || issue.reporter?.email}
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span>{issue.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Priority</span>
            <span>{issue.priority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Severity</span>
            <span>{issue.severity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Assignee</span>
            <span>{issue.assignee?.name || "Unassigned"}</span>
          </div>
          {issue.description && (
            <div className="pt-2">
              <p className="text-muted-foreground">Description</p>
              <p className="mt-1">{issue.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Button
              key={s}
              variant={issue.status === s ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(s)}
            >
              {s.replace("_", " ")}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 && (
            <p className="text-muted-foreground text-sm">No comments yet.</p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="border-b pb-3 last:border-0">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {c.author?.name || c.author?.email}
                </span>
                <span className="text-muted-foreground text-xs">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm">{c.content}</p>
            </div>
          ))}

          <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <Button type="submit">Post</Button>
          </form>
          {commentError && (
            <p className="text-sm text-red-500">{commentError}</p>
          )}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.length === 0 && (
            <p className="text-muted-foreground text-sm">No activity yet.</p>
          )}
          {activity.map((a) => (
            <div key={a._id} className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">
                {a.user?.name || a.user?.email}
              </span>{" "}
              {a.action}
              <span className="ml-2 text-xs">
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
