import mongoose, { Schema, type Model } from 'mongoose';

/** Gmail message mirrored in MongoDB for inbox / thread views. */
export interface IInboxEmail {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  gmailMessageId: string;
  threadId: string;
  /** From header (may include display name) */
  sender: string;
  /** Parsed To/Cc addresses */
  receiver: string[];
  subject: string;
  /** HTML or plain body (best effort) */
  message: string;
  snippet?: string;
  isRead: boolean;
  internalDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inboxEmailSchema = new Schema<IInboxEmail>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gmailMessageId: { type: String, required: true, trim: true },
    threadId: { type: String, required: true, index: true },
    sender: { type: String, required: true, trim: true },
    receiver: [{ type: String, trim: true, lowercase: true }],
    subject: { type: String, default: '', trim: true },
    message: { type: String, default: '' },
    snippet: { type: String, default: '' },
    isRead: { type: Boolean, default: true },
    internalDate: { type: Date, required: true },
  },
  { timestamps: true }
);

inboxEmailSchema.index({ userId: 1, threadId: 1, internalDate: -1 });
inboxEmailSchema.index({ userId: 1, gmailMessageId: 1 }, { unique: true });

export const InboxEmail: Model<IInboxEmail> =
  (mongoose.models.InboxEmail as Model<IInboxEmail>) ??
  mongoose.model<IInboxEmail>('InboxEmail', inboxEmailSchema);
