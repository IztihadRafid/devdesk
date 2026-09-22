import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import { getUserProjectRole, hasPermission } from "@/lib/authz";
import { callAI } from "@/lib/services/ai.service";
import { checkRateLimit } from "@/lib/rate-limit";
const requestSchema = z.object({
  issueId: z.string(),
});

const analysisSchema = z.object({
  possibleCause: z.string(),
  investigationSuggestions: z.array(z.string()),
  suggestedTestCases: z.array(z.string()),
  edgeCases: z.array(z.string()),
  suggestedSeverity: z.enum(["critical", "high", "medium", "low"]),
  suggestedPriority: z.enum(["urgent", "high", "medium", "low"]),
});

const SYSTEM_PROMPT = `You are a senior software engineer analyzing bug reports.
Given a bug report, respond with ONLY valid JSON (no markdown, no code fences, no explanation) matching this exact shape:
{
  "possibleCause": "string - likely technical cause",
  "investigationSuggestions": ["string array - what to check/investigate"],
  "suggestedTestCases": ["string array - relevant test cases"],
  "edgeCases": ["string array - overlooked scenarios to consider"],
  "suggestedSeverity": "critical" | "high" | "medium" | "low",
  "suggestedPriority": "urgent" | "high" | "medium" | "low"
}`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

const rateLimit = checkRateLimit(`ai-analyze:${session.user.id}`, 10, 60_000); // 10 requests per minute
if (!rateLimit.allowed) {
  return NextResponse.json(
    { success: false, message: `Too many requests. Try again in ${rateLimit.retryAfterSeconds}s.` },
    { status: 429 }
  );
}
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const issue = await Issue.findById(parsed.data.issueId);
  if (!issue) {
    return NextResponse.json({ success: false, message: "Issue not found" }, { status: 404 });
  }

  const role = await getUserProjectRole(session.user.id, issue.project.toString());
  if (!hasPermission(role, "viewProject")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  // minimum necessary context — only this issue's fields, nothing else from the DB
  const userPrompt = `
Title: ${issue.title}
Description: ${issue.description || "N/A"}
Type: ${issue.type}
Severity: ${issue.severity}
Priority: ${issue.priority}
Environment: ${issue.environment || "N/A"}
Steps to reproduce: ${issue.steps || "N/A"}
Expected result: ${issue.expectedResult || "N/A"}
Actual result: ${issue.actualResult || "N/A"}
`.trim();

  try {
    const raw = await callAI(SYSTEM_PROMPT, userPrompt, 800);

    // strip potential markdown code fences the model might add despite instructions
    const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
    const jsonData = JSON.parse(cleaned);

    const validated = analysisSchema.safeParse(jsonData);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: "AI returned an unexpected format. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, analysis: validated.data });
  } catch (error) {
      console.error("AI analysis error:", error);
    return NextResponse.json(
      { success: false, message: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}