"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";
interface Project {
  _id: string;
  name: string;
  key: string;
  description?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  async function loadProjects() {
    setLoading(true);
    const res = await fetch("/api/projects");
    const data = await res.json();
    if (data.success) setProjects(data.projects);
    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, key }),
    });
    const data = await res.json();

    if (!data.success) {
      setError(data.message);
      return;
    }

    setName("");
    setKey("");
    loadProjects();
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Projects</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Create a project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Key (e.g. VLX)</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                maxLength={10}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit">Create project</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border bg-muted/30"
              />
            ))}
          </div>
        )}
        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <FolderKanban className="text-muted-foreground/40 h-10 w-10" />
            <p className="text-muted-foreground mt-3 text-sm">
              No projects yet. Create your first one above.
            </p>
          </div>
        )}
        {projects.map((p) => (
          <Link key={p._id} href={`/projects/${p._id}`}>
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{p?.name}</p>
                  <p className="text-muted-foreground text-sm">{p?.key}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
