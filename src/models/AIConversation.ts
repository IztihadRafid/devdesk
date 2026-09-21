import { Schema, models, model, Types } from "mongoose";

export interface IAIMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IAIConversation {
  user: Types.ObjectId;
  project?: Types.ObjectId;
  title: string;
  messages: IAIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const aiMessageSchema = new Schema<IAIMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const aiConversationSchema = new Schema<IAIConversation>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    title: { type: String, required: true },
    messages: { type: [aiMessageSchema], default: [] },
  },
  { timestamps: true }
);

const AIConversation =
  models.AIConversation || model<IAIConversation>("AIConversation", aiConversationSchema);
export default AIConversation;