"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MeshGradient } from "@/components/mesh-gradient";
import { UserMenu } from "@/components/user-menu";
import {
  Bug,
  MessageSquare,
  Sparkles,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  return (
    <main className="flex min-h-screen flex-col">
      <MeshGradient />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/60">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DevDesk</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="ghost" className="hidden sm:flex">
                    Dashboard
                  </Button>
                </Link>
                <UserMenu />
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:flex">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="shadow-lg shadow-primary/25">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 text-center overflow-hidden bg-background">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-primary/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-foreground/90">
              AI-Powered Development Platform
            </span>
          </div>

          {/* Main heading */}
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-foreground">
            <span className="bg-linear-to-r from-foreground via-foreground to-foreground/90 bg-clip-text text-transparent">
              Track bugs.
            </span>
            <br />
            <span className="bg-linear-to-r from-foreground via-foreground to-foreground/90 bg-clip-text text-transparent">
              Chat with your team.
            </span>
            <br />
            <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Let AI do the boring part.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            DevDesk combines issue tracking, team chat, and AI-powered bug
            analysis in one seamless platform — built for modern development
            teams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-xl shadow-primary/25"
              >
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
              >
                View demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free forever for small teams</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>AI-powered insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-background py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Everything you need to ship faster
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful features designed to streamline your development workflow
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Bug className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="relative mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-primary text-foreground">
                Smart Issue Tracking
              </h3>
              <p className="relative text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                AI-powered bug analysis that automatically categorizes,
                prioritizes, and suggests solutions for your issues.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <MessageSquare className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="relative mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-primary text-foreground">
                Real-time Team Chat
              </h3>
              <p className="relative text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                Collaborate seamlessly with built-in messaging. Discuss issues,
                share code snippets, and stay aligned.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Sparkles className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="relative mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-primary text-foreground">
                AI-Powered Insights
              </h3>
              <p className="relative text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                Get intelligent recommendations and automated analysis to help
                you resolve issues faster.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Zap className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="relative mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-primary text-foreground">
                Lightning Fast
              </h3>
              <p className="relative text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                Built with performance in mind. Instant loading, real-time
                updates, and smooth interactions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Shield className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="relative mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-primary text-foreground">
                Secure by Design
              </h3>
              <p className="relative text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                Enterprise-grade security with end-to-end encryption and secure
                authentication.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Users className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="relative mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-primary text-foreground">
                Team Collaboration
              </h3>
              <p className="relative text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                Designed for small teams. Easy onboarding, intuitive interface,
                and powerful collaboration tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-background py-24">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-primary/10 via-primary/5 to-muted p-12 text-center">
            <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                Ready to transform your workflow?
              </h2>
              <p className="mb-8 max-w-2xl mx-auto text-lg text-muted-foreground">
                Join thousands of developers who are already shipping faster
                with DevDesk.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base shadow-xl">
                  Get started for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background px-6 py-8">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/60">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">DevDesk</span>
            </div>
            <p className="text-sm text-muted-foreground">
              DevDesk — A modern project management and issue tracking platform
              built by Iztihad Rafid.
            </p>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
