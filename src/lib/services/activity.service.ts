import Activity from "@/models/Activity";
import Notification from "@/models/Notification";
import { Types } from "mongoose";

export async function logActivity({
  project,
  user,
  action,
  entityType,
  entityId,
  metadata,
}: {
  project: string;
  user: string;
  action: string;
  entityType: "issue" | "project" | "comment";
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await Activity.create({ project, user, action, entityType, entityId, metadata });
}

export async function notify({
  recipient,
  type,
  message,
  relatedEntity,
}: {
  recipient: string;
  type: string;
  message: string;
  relatedEntity?: { type: string; id: string };
}) {

  await Notification.create({ recipient, type, message, relatedEntity });
}