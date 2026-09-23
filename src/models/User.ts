import { Schema, models, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  provider: "credentials" | "google";
   isDeleted: boolean;
  createdAt: Date;
}


const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    image: { type: String },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", userSchema);
export default User;