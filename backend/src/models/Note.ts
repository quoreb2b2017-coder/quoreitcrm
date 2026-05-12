import mongoose, { Schema, type Model } from 'mongoose';

export interface INote {
  _id: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  recruiterId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  tags: mongoose.Types.ObjectId[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

noteSchema.index({ candidateId: 1, createdAt: -1 });
noteSchema.index({ candidateId: 1, isPinned: 1 });

export const Note: Model<INote> =
  (mongoose.models.Note as Model<INote>) ?? mongoose.model<INote>('Note', noteSchema);
