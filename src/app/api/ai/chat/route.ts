import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import AIConversation from "@/models/AIConversation";
import { callAI } from "@/lib/services/ai.service";

const chatSchema = z.object({
  conversationId: z.string().nullable().optional(),
  message: z.string().min(1),
});
const SYSTEM_PROMPT = `You are a helpful AI assistant for software developers and QA engineers using DevDesk, a bug tracking and team collaboration tool. Answer questions about debugging, testing, error messages, and general development practices concisely and practically. Use markdown formatting and code blocks where helpful.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  await connectDB();

  let conversation;
  if (parsed.data.conversationId) {
    conversation = await AIConversation.findOne({
      _id: parsed.data.conversationId,
      user: session.user.id,
    });
    if (!conversation) {
      return NextResponse.json({ success: false, message: "Conversation not found" }, { status: 404 });
    }
  } else {
    conversation = await AIConversation.create({
      user: session.user.id,
      title: parsed.data.message.slice(0, 50),
      messages: [],
    });
  }

  conversation.messages.push({ role: "user", content: parsed.data.message });

  try {
 
    const recentHistory = conversation.messages.slice(-10);
    const historyText = recentHistory
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    const reply = await callAI(SYSTEM_PROMPT, historyText, 800);

    conversation.messages.push({ role: "assistant", content: reply });
    await conversation.save();

    return NextResponse.json({
      success: true,
      conversationId: conversation._id,
      reply,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { success: false, message: "AI chat failed. Please try again." },
      { status: 500 }
    );
  }
}