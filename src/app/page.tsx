import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col ">
      <nav className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-bold">DevDesk</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/register">
            <Button>Get started</Button>
          </Link>
        </div>
      </nav>

      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Track bugs. Chat with your team.
          <br />
          Let AI do the boring part.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-lg">
          DevDesk combines issue tracking, team chat, and AI-powered bug
          analysis in one place — built for small dev teams.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/register">
            <Button size="lg">Start for free</Button>
          </Link>
        </div>
      </section>

      <footer className="text-muted-foreground border-t px-6 py-4 text-center text-sm">
        Built by Iztihad Rafid — DevDesk is a portfolio project.
      </footer>
    </main>
  );
}
