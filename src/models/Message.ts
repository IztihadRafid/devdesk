import { Schema, models, model, Types } from "mongoose";

export interface IMessage {
  project: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Message = models.Message || model<IMessage>("Message", messageSchema);
export default Message;