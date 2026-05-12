import mongoose, { Schema, type Model } from 'mongoose';

export interface IExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface IEducation {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface ICandidateProfile {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  phone: string;
  headline: string;
  summary: string;
  resumePath: string | null;
  resumePublicId?: string | null;
  skills: string[];
  experience: IExperience[];
  education: IEducation[];
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<IExperience>(
  {
    company: { type: String, required: true, trim: true, maxlength: 200 },
    role: { type: String, required: true, trim: true, maxlength: 200 },
    startDate: { type: String, required: true, trim: true, maxlength: 50 },
    endDate: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: true }
);

const educationSchema = new Schema<IEducation>(
  {
    school: { type: String, required: true, trim: true, maxlength: 200 },
    degree: { type: String, required: true, trim: true, maxlength: 120 },
    field: { type: String, required: true, trim: true, maxlength: 120 },
    startDate: { type: String, required: true, trim: true, maxlength: 50 },
    endDate: { type: String, required: true, trim: true, maxlength: 50 },
  },
  { _id: true }
);

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: { type: String, trim: true, maxlength: 50, default: '' },
    headline: { type: String, trim: true, maxlength: 200, default: '' },
    summary: { type: String, trim: true, maxlength: 5000, default: '' },
    resumePath: { type: String, default: null },
    resumePublicId: { type: String, default: null },
    skills: [{ type: String, trim: true, maxlength: 100 }],
    experience: [experienceSchema],
    education: [educationSchema],
  },
  { timestamps: true }
);




export const CandidateProfile: Model<ICandidateProfile> =
  (mongoose.models.CandidateProfile as Model<ICandidateProfile>) ??
  mongoose.model<ICandidateProfile>('CandidateProfile', candidateProfileSchema);
