import { Schema, models, model, Types } from "mongoose";

export interface IActivity {
  project: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  entityType: "issue" | "project" | "comment";
  entityId: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ["issue", "project", "comment"], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Activity = models.Activity || model<IActivity>("Activity", activitySchema);
export default Activity;