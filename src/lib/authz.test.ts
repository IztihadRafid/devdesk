import { describe, it, expect } from "vitest";
import { hasPermission } from "./authz";

describe("hasPermission", () => {
  it("owner can manage project", () => {
    expect(hasPermission("owner", "manageProject")).toBe(true);
  });

  it("admin cannot manage project settings", () => {
    expect(hasPermission("admin", "manageProject")).toBe(false);
  });

  it("developer can create issues", () => {
    expect(hasPermission("developer", "createIssue")).toBe(true);
  });

  it("viewer cannot create issues", () => {
    expect(hasPermission("viewer", "createIssue")).toBe(false);
  });

  it("viewer can only view the project", () => {
    expect(hasPermission("viewer", "viewProject")).toBe(true);
    expect(hasPermission("viewer", "editAnyIssue")).toBe(false);
    expect(hasPermission("viewer", "deleteIssue")).toBe(false);
  });

  it("returns false when role is undefined (not a member)", () => {
    expect(hasPermission(undefined, "viewProject")).toBe(false);
  });

  it("tester can create issues but not edit any issue", () => {
    expect(hasPermission("tester", "createIssue")).toBe(true);
    expect(hasPermission("tester", "editAnyIssue")).toBe(false);
  });
});