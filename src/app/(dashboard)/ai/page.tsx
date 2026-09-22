"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
interface ConversationSummary {
  _id: string;
  title: string;
  updatedAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadConversations() {
    const res = await fetch("/api/ai/conversations");
    const data = await res.json();
    if (data.success) setConversations(data.conversations);
  }

  async function loadConversation(id: string) {
    const res = await fetch(`/api/ai/conversations/${id}`);
    const data = await res.json();
    if (data.success) {
      setActiveId(id);
      setMessages(data.conversation.messages);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
    loadConversations();
  }

  function startNewConversation() {
    setActiveId(null);
    setMessages([]);
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeId,
        message: userMessage,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);
    if (!activeId) {
      setActiveId(data.conversationId);
      loadConversations();
    }
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Sidebar */}
      <div className="w-64 border-r p-3">
        <Button
          onClick={startNewConversation}
          className="mb-3 w-full"
          size="sm"
        >
          + New conversation
        </Button>
        <div className="space-y-1">
          {conversations.map((c) => (
            <div
              key={c._id}
              onClick={() => loadConversation(c._id)}
              className={`group flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent ${
                activeId === c._id ? "bg-accent" : ""
              }`}
            >
              <span className="truncate">{c.title}</span>
              <button
                onClick={(e) => handleDelete(c._id, e)}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-20 text-center">
              <Sparkles className="text-muted-foreground/40 h-10 w-10" />
              <p className="text-muted-foreground mt-3 text-sm">
                Ask me anything about debugging, testing, or your code.
              </p>
            </div>
          )}
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground ml-12"
                    : "bg-muted mr-12"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {loading && (
              <div className="bg-muted mr-12 rounded-lg p-3 text-sm">
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <form onSubmit={handleSend} className="mx-auto w-full max-w-2xl p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI assistant..."
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
