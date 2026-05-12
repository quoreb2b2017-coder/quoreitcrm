import mongoose, { Schema, type Model } from 'mongoose';

export type CallType = 'incoming' | 'outgoing';
export type CallOutcome = 'Interested' | 'Not Answered' | 'Call Back Later' | 'Rejected';

export interface ICall {
  _id: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  recruiterId: mongoose.Types.ObjectId;
  type: CallType;
  duration: number;
  outcome: CallOutcome;
  notes: string;
  addToCalendar?: boolean;
  createMeetLink?: boolean;
  startAt?: Date | null;
  endAt?: Date | null;
  meetLink?: string | null;
  calendarEventId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new Schema<ICall>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['incoming', 'outgoing'], required: true },
    duration: { type: Number, required: true, min: 0 },
    outcome: {
      type: String,
      enum: ['Interested', 'Not Answered', 'Call Back Later', 'Rejected'],
      required: true,
    },
    notes: { type: String, default: '', trim: true },
    addToCalendar: { type: Boolean, default: false },
    createMeetLink: { type: Boolean, default: false },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    meetLink: { type: String, default: null, trim: true },
    calendarEventId: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

callSchema.index({ candidateId: 1, createdAt: -1 });

export const Call: Model<ICall> =
  (mongoose.models.Call as Model<ICall>) ?? mongoose.model<ICall>('Call', callSchema);
