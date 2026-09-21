import { Schema, models, model, Types } from "mongoose";

export interface INotification {
  recipient: Types.ObjectId;
  type: string;
  message: string;
  relatedEntity?: { type: string; id: Types.ObjectId };
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    relatedEntity: {
      type: { type: String },
      id: { type: Schema.Types.ObjectId },
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Notification = models.Notification || model<INotification>("Notification", notificationSchema);
export default Notification;