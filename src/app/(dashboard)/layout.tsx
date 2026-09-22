"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    { href: "/ai", label: "AI Assistant" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold">
            DevDesk
          </Link>
          <nav className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <SearchBar />

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
          <UserMenu />
        </div>
      </header>
      {children}
    </div>
  );
}
