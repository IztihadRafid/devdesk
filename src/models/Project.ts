import { Schema, models, model, Types } from "mongoose";

export type ProjectRole = "owner" | "admin" | "developer" | "tester" | "viewer";

export interface IProjectMember {
  user: Types.ObjectId;
  role: ProjectRole;
}

export interface IProject {
  name: string;
  key: string;
  description?: string;
  owner: Types.ObjectId;
  members: IProjectMember[];
  issueCounter: number;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IProjectMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "developer", "tester", "viewer"],
      required: true,
    },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [memberSchema], default: [] },
    issueCounter: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Project = models.Project || model<IProject>("Project", projectSchema);
projectSchema.index({ name: "text", description: "text" });
export default Project;