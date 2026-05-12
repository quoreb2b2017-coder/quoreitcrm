import mongoose, { Schema, type Model } from 'mongoose';

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  encryptedMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderName: { type: String, required: true, trim: true },
    encryptedMessage: { type: String, required: true },
  },
  { timestamps: true }
);

messageSchema.index({ jobId: 1, createdAt: 1 });

export const Message: Model<IMessage> =
  (mongoose.models.Message as Model<IMessage>) ?? mongoose.model<IMessage>('Message', messageSchema);

