"use client";

import { useEffect, useRef, useState, use } from "react";
import * as Ably from "ably";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  _id: string;
  content: string;
  sender: { name: string; email: string };
  createdAt: string;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadHistory() {
    const res = await fetch(`/api/projects/${id}/messages`);
    const data = await res.json();
    if (data.success) setMessages(data.messages);
  }

  useEffect(() => {
    loadHistory();

    const ably = new Ably.Realtime({
      authUrl: "/api/ably/token",
    });

    const channel = ably.channels.get(`project:${id}`);

    channel.subscribe("new-message", (msg) => {
      setMessages((prev) => [...prev, msg.data as Message]);
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    await fetch(`/api/projects/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setText("");
  }

  return (
    <main className="mx-auto flex h-[calc(100vh-57px)] max-w-2xl flex-col p-4">
      <h1 className="mb-4 text-xl font-bold">Project Chat</h1>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m._id} className="text-sm">
              <span className="font-medium">
                {m.sender?.name || m.sender?.email}
              </span>
              <span className="text-muted-foreground ml-2 text-xs">
                {new Date(m.createdAt).toLocaleTimeString()}
              </span>
              <p>{m.content}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <Button type="submit">Send</Button>
      </form>
    </main>
  );
}
