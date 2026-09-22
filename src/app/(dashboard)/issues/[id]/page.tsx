"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { SeverityBadge, PriorityBadge } from "@/components/status-badge";
import { toast } from "sonner";
interface Issue {
  _id: string;
  issueNumber: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  severity: string;
  type: string;
  project: string;
  reporter: { name: string; email: string };
  assignee?: { _id: string; name: string; email: string };
}
interface Analysis {
  possibleCause: string;
  investigationSuggestions: string[];
  suggestedTestCases: string[];
  edgeCases: string[];
  suggestedSeverity: string;
  suggestedPriority: string;
}
interface Comment {
  _id: string;
  content: string;
  author: { _id: string; name: string; email: string };
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
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { data: session } = useSession();
  const [members, setMembers] = useState<
    { user: { _id: string; name: string; email: string } }[]
  >([]);
  const router = useRouter();

  async function loadMembers(projectId: string) {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();
    if (data.success) setMembers(data.project.members);
  }
  async function loadIssue() {
    const res = await fetch(`/api/issues/${id}`);
    const data = await res.json();
    if (data.success) {
      setIssue(data.issue);
      loadMembers(data.issue.project);
    } else setError(data.message);
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
  async function handleDeleteIssue() {
    const res = await fetch(`/api/issues/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success && issue) {
      toast.success("Issue deleted");
      router.push(`/projects/${issue.project}`);
    } else {
      toast.error(data.message || "Failed to delete issue");
    }
  }
  async function handleAssign(userId: string) {
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignee: userId }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message);
      return;
    }
    loadIssue();
  }
  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalysisError("");
    setAnalysis(null);

    const res = await fetch("/api/ai/analyze-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId: id }),
    });
    const data = await res.json();

    if (!data.success) {
      setAnalysisError(data.message);
    } else {
      setAnalysis(data.analysis);
    }
    setAnalyzing(false);
  }

  async function applySuggestion(
    field: "severity" | "priority",
    value: string,
  ) {
    await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    loadIssue();
  }
  async function handleDeleteComment(commentId: string) {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    loadComments();
  }

  async function handleEditSave(commentId: string) {
    await fetch(`/api/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    setEditingCommentId(null);
    loadComments();
  }
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{issue.title}</h1>
          <p className="text-muted-foreground mt-1">
            Reported by {issue.reporter?.name || issue.reporter?.email}
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger className="border-input inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm text-red-500 hover:bg-red-500/10">
            Delete Issue
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this issue?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this issue and all its comments.
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteIssue}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

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
            <PriorityBadge priority={issue.priority} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Severity</span>
            <SeverityBadge severity={issue.severity} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Assignee</span>
            <Select
              value={issue.assignee?._id || "unassigned"}
              onValueChange={(v) =>
                v && handleAssign(v === "unassigned" ? "" : v)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.user._id} value={m.user._id}>
                    {m.user.name || m.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <CardTitle>AI Bug Analyzer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleAnalyze} disabled={analyzing} size="sm">
            {analyzing ? "Analyzing..." : "Analyze with AI"}
          </Button>

          {analysisError && (
            <p className="text-sm text-red-500">{analysisError}</p>
          )}

          {analysis && (
            <div className="space-y-3 border-t pt-3 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">
                  Possible Cause
                </p>
                <p>{analysis.possibleCause}</p>
              </div>

              <div>
                <p className="text-muted-foreground font-medium">
                  Investigation Suggestions
                </p>
                <ul className="list-disc pl-5">
                  {analysis.investigationSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-muted-foreground font-medium">
                  Suggested Test Cases
                </p>
                <ul className="list-disc pl-5">
                  {analysis.suggestedTestCases.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-muted-foreground font-medium">Edge Cases</p>
                <ul className="list-disc pl-5">
                  {analysis.edgeCases.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between rounded-md border p-2">
                <span>
                  Suggested severity:{" "}
                  <strong>{analysis.suggestedSeverity}</strong>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    applySuggestion("severity", analysis.suggestedSeverity)
                  }
                >
                  Apply
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-md border p-2">
                <span>
                  Suggested priority:{" "}
                  <strong>{analysis.suggestedPriority}</strong>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    applySuggestion("priority", analysis.suggestedPriority)
                  }
                >
                  Apply
                </Button>
              </div>
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
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {c.author?.name || c.author?.email}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                  {session?.user?.id === c.author?._id &&
                    editingCommentId !== c._id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingCommentId(c._id);
                            setEditContent(c.content);
                          }}
                          className="text-muted-foreground text-xs hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                </div>
              </div>

              {editingCommentId === c._id ? (
                <div className="mt-1 flex gap-2">
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-sm"
                  />
                  <Button size="sm" onClick={() => handleEditSave(c._id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingCommentId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <p className="mt-1 text-sm">{c.content}</p>
              )}
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
