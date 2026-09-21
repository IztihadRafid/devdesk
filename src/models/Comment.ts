import { Schema, models, model, Types } from "mongoose";

export interface IComment {
  issue: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    issue: { type: Schema.Types.ObjectId, ref: "Issue", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Comment = models.Comment || model<IComment>("Comment", commentSchema);
export default Comment;