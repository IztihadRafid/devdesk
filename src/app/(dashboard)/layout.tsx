import Link from "next/link";
import { NotificationBell } from "@/components/notification-bell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/dashboard" className="font-bold">
          DevDesk
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/projects" className="text-sm hover:underline">
            Projects
          </Link>
          <NotificationBell />
        </div>
      </header>
      {children}
    </div>
  );
}
