"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    if (data.success) setNotifications(data.notifications);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    load();
  }

  async function markAllAsRead() {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    load();
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-muted-foreground text-xs hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="text-muted-foreground px-3 py-4 text-center text-sm">
              No notifications
            </p>
          )}
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-accent ${
                !n.isRead ? "bg-accent/50 font-medium" : "text-muted-foreground"
              }`}
            >
              {n.message}
              <div className="text-muted-foreground mt-0.5 text-xs font-normal">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
