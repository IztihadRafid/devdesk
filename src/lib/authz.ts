import { ProjectRole } from "@/models/Project";

type Permission =
  | "manageProject"     
  | "manageMembers"      
  | "createIssue"
  | "editAnyIssue"     
  | "editOwnAssignedIssue" 
  | "deleteIssue"
  | "viewProject";

const rolePermissions: Record<ProjectRole, Permission[]> = {
  owner: [
    "manageProject",
    "manageMembers",
    "createIssue",
    "editAnyIssue",
    "editOwnAssignedIssue",
    "deleteIssue",
    "viewProject",
  ],
  admin: [
    "manageMembers",
    "createIssue",
    "editAnyIssue",
    "editOwnAssignedIssue",
    "deleteIssue",
    "viewProject",
  ],
  developer: ["createIssue", "editOwnAssignedIssue", "viewProject"],
  tester: ["createIssue", "editOwnAssignedIssue", "viewProject"],
  viewer: ["viewProject"],
};



export function hasPermission(
  role: ProjectRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role].includes(permission);
}import { connectDB } from "@/lib/db";
import Project from "@/models/Project";



export async function getUserProjectRole(
  userId: string,
  projectId: string
): Promise<ProjectRole | undefined> {
  await connectDB();
  const project = await Project.findById(projectId);
  if (!project) return undefined;

  const member = project.members.find((m) => m.user.toString() === userId);
  return member?.role;
}