import mongoose, { Schema, type Model } from 'mongoose';

export interface ITag {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true, default: '#6b7280' },
  },
  { timestamps: true }
);

tagSchema.index({ name: 1 }, { unique: true });

export const Tag: Model<ITag> =
  (mongoose.models.Tag as Model<ITag>) ?? mongoose.model<ITag>('Tag', tagSchema);
