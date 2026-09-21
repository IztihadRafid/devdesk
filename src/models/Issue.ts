import { Schema, models, model, Types } from "mongoose";

export type IssueType = "bug" | "task" | "feature" | "improvement";
export type IssueStatus = "open" | "in_progress" | "testing" | "resolved" | "closed" | "reopened";
export type IssuePriority = "urgent" | "high" | "medium" | "low";
export type IssueSeverity = "critical" | "high" | "medium" | "low";

export interface IIssue {
  project: Types.ObjectId;
  issueNumber: number;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  reporter: Types.ObjectId;
  assignee?: Types.ObjectId;
  labels: string[];
  environment?: string;
  steps?: string;
  expectedResult?: string;
  actualResult?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    issueNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ["bug", "task", "feature", "improvement"], default: "bug" },
    status: {
      type: String,
      enum: ["open", "in_progress", "testing", "resolved", "closed", "reopened"],
      default: "open",
    },
    priority: { type: String, enum: ["urgent", "high", "medium", "low"], default: "medium" },
    severity: { type: String, enum: ["critical", "high", "medium", "low"], default: "medium" },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    labels: { type: [String], default: [] },
    environment: { type: String },
    steps: { type: String },
    expectedResult: { type: String },
    actualResult: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// compound index so VLX-101 style lookups are fast, and numbers stay unique per project
issueSchema.index({ project: 1, issueNumber: 1 }, { unique: true });

const Issue = models.Issue || model<IIssue>("Issue", issueSchema);
export default Issue;