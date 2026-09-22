import { describe, it, expect } from "vitest";
import { z } from "zod";

// Same schema shape as your register route — testing the validation logic directly
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      name: "Rafid",
      email: "rafid@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = registerSchema.safeParse({
      email: "rafid@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = registerSchema.safeParse({
      name: "Rafid",
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password under 6 characters", () => {
    const result = registerSchema.safeParse({
      name: "Rafid",
      email: "rafid@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name under 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "R",
      email: "rafid@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });
});

const createIssueSchema = z.object({
  title: z.string().min(2),
  type: z.enum(["bug", "task", "feature", "improvement"]).default("bug"),
  priority: z.enum(["urgent", "high", "medium", "low"]).default("medium"),
  severity: z.enum(["critical", "high", "medium", "low"]).default("medium"),
});

describe("createIssueSchema", () => {
  it("accepts valid issue with defaults applied", () => {
    const result = createIssueSchema.safeParse({ title: "Login button broken" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("bug");
      expect(result.data.priority).toBe("medium");
    }
  });

  it("rejects invalid severity enum value", () => {
    const result = createIssueSchema.safeParse({
      title: "Login button broken",
      severity: "super-critical", // not a valid enum value
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const result = createIssueSchema.safeParse({ type: "bug" });
    expect(result.success).toBe(false);
  });
});