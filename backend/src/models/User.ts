import mongoose, { Schema, type Model } from 'mongoose';
import type { UserRole } from '@ats-saas/shared';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  bio?: string;
  introVideoUrl?: string;
  phoneNumbers?: string[];
  phoneConnected?: boolean;
  googleConnected?: boolean;
  /** Encrypted-at-rest not applied; treat as secret (select: false). */
  googleRefreshToken?: string;
  googleEmail?: string;
  gmailConnected?: boolean;
  googleAccessToken?: string;
  googleAccessTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['admin', 'recruiter'],
      default: 'recruiter',
    },
    avatar: { type: String },
    company: { type: String, trim: true },
    bio: { type: String, trim: true },
    introVideoUrl: { type: String, trim: true },
    phoneNumbers: [{ type: String, trim: true }],
    phoneConnected: { type: Boolean, default: false },
    googleConnected: { type: Boolean, default: false },
    googleRefreshToken: { type: String, select: false },
    googleEmail: { type: String, trim: true },
    gmailConnected: { type: Boolean, default: false },
    googleAccessToken: { type: String, select: false },
    googleAccessTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ?? mongoose.model<IUser>('User', userSchema);
