import mongoose, { Schema, type Model } from 'mongoose';

export interface IProject {
  _id: mongoose.Types.ObjectId;
  name: string;
  recruiterId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

projectSchema.index({ recruiterId: 1 });
projectSchema.index({ recruiterId: 1, name: 1 }, { unique: true });

export const Project: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ?? mongoose.model<IProject>('Project', projectSchema);
