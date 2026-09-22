import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// mock the DB connection and User model so no real database is touched
vi.mock("@/lib/db", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/User", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

import User from "@/models/User";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid input with 400", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "R", email: "not-an-email", password: "123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("rejects registration when email already exists", async () => {
    vi.mocked(User.findOne).mockResolvedValue({ email: "taken@example.com" } as any);

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Rafid",
        email: "taken@example.com",
        password: "secret123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.message).toBe("Email already registered");
  });

  it("creates a new user with valid, unique input", async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    vi.mocked(User.create).mockResolvedValue({} as any);

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Rafid",
        email: "new@example.com",
        password: "secret123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(User.create).toHaveBeenCalledOnce();
  });
});