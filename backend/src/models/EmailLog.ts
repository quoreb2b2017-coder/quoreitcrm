import mongoose, { Schema, type Model } from 'mongoose';

export interface IEmailLog {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  from: string;
  to: string[];
  subject: string;
  html: string;
  attachments?: { filename: string; contentType?: string }[];
  /** Set when Gmail API accepts the send (users.messages.send). */
  gmailMessageId?: string;
  gmailThreadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    from: { type: String, required: true, trim: true },
    to: [{ type: String, required: true, trim: true, lowercase: true, index: true }],
    subject: { type: String, required: true, trim: true },
    html: { type: String, required: true },
    attachments: [
      {
        filename: { type: String, required: true },
        contentType: { type: String },
      },
    ],
    gmailMessageId: { type: String, trim: true, index: true },
    gmailThreadId: { type: String, trim: true },
  },
  { timestamps: true }
);

emailLogSchema.index({ userId: 1, createdAt: -1 });
emailLogSchema.index({ to: 1, createdAt: -1 });

export const EmailLog: Model<IEmailLog> =
  (mongoose.models.EmailLog as Model<IEmailLog>) ?? mongoose.model<IEmailLog>('EmailLog', emailLogSchema);

