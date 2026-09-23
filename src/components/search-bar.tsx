"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Project {
  _id: string;
  name: string;
  key: string;
}

interface Issue {
  _id: string;
  issueNumber: number;
  title: string;
  project: { key: string };
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setProjects([]);
      setIssues([]);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
        setIssues(data.issues);
        setOpen(true);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function goTo(path: string) {
    setOpen(false);
    setQuery("");
    router.push(path);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative w-full max-w-sm block">
        <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search projects, issues..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start" initialFocus={false}>
        {projects.length === 0 && issues.length === 0 && (
          <p className="text-muted-foreground p-2 text-sm">No results</p>
        )}

        {projects.length > 0 && (
          <div className="mb-2">
            <p className="text-muted-foreground px-2 py-1 text-xs font-medium">
              Projects
            </p>
            {projects.map((p) => (
              <button
                key={p._id}
                onClick={() => goTo(`/projects/${p._id}`)}
                className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                {p.name}{" "}
                <span className="text-muted-foreground">({p.key})</span>
              </button>
            ))}
          </div>
        )}

        {issues.length > 0 && (
          <div>
            <p className="text-muted-foreground px-2 py-1 text-xs font-medium">
              Issues
            </p>
            {issues.map((issue) => (
              <button
                key={issue._id}
                onClick={() => goTo(`/issues/${issue._id}`)}
                className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span className="text-muted-foreground">
                  {issue.project.key}-{issue.issueNumber}
                </span>{" "}
                {issue.title}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
