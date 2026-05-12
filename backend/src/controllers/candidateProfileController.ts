import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { uploadByType, deleteFromCloudinary } from '../services/uploadService.js';
import type { ICandidateProfile, IExperience, IEducation } from '../models/CandidateProfile.js';

function toExperience(item: IExperience) {
  return {
    company: item.company,
    role: item.role,
    startDate: item.startDate,
    endDate: item.endDate,
    description: item.description,
  };
}

function toEducation(item: IEducation) {
  return {
    school: item.school,
    degree: item.degree,
    field: item.field,
    startDate: item.startDate,
    endDate: item.endDate,
  };
}

function toProfileResponse(profile: ICandidateProfile) {
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    phone: profile.phone ?? '',
    headline: profile.headline ?? '',
    summary: profile.summary ?? '',
    resumePath: profile.resumePath ?? null,
    resumePublicId: profile.resumePublicId ?? null,
    skills: profile.skills ?? [],
    experience: (profile.experience ?? []).map(toExperience),
    education: (profile.education ?? []).map(toEducation),
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

/** GET own candidate profile (create empty if not exists) */
export const getMyProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError(401, 'Authentication required');

  let profile = await CandidateProfile.findOne({ userId }).lean();
  if (!profile) {
    const created = await CandidateProfile.create({
      userId,
      phone: '',
      headline: '',
      summary: '',
      resumePath: null,
      skills: [],
      experience: [],
      education: [],
    });
    profile = created.toObject();
  }
  res.json({
    success: true,
    data: toProfileResponse(profile as ICandidateProfile),
  });
});

/** PUT own candidate profile */
export const updateMyProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError(401, 'Authentication required');

  const body = req.body as {
    phone?: string;
    headline?: string;
    summary?: string;
    skills?: string[];
    experience?: Array<{ company: string; role: string; startDate: string; endDate: string; description?: string }>;
    education?: Array<{ school: string; degree: string; field: string; startDate: string; endDate: string }>;
  };

  let profile = await CandidateProfile.findOne({ userId });
  if (!profile) {
    profile = await CandidateProfile.create({
      userId,
      phone: body.phone ?? '',
      headline: body.headline ?? '',
      summary: body.summary ?? '',
      resumePath: null,
      skills: body.skills ?? [],
      experience: body.experience ?? [],
      education: body.education ?? [],
    });
  } else {
    if (body.phone !== undefined) profile.phone = body.phone;
    if (body.headline !== undefined) profile.headline = body.headline;
    if (body.summary !== undefined) profile.summary = body.summary;
    if (body.skills !== undefined) profile.skills = body.skills;
    if (body.experience !== undefined) profile.experience = body.experience;
    if (body.education !== undefined) profile.education = body.education;
    await profile.save();
  }
  res.json({
    success: true,
    data: toProfileResponse(profile.toObject() as ICandidateProfile),
  });
});

/** POST resume upload (Multer memory → Cloudinary). Stores Cloudinary URL in profile. Config from .env (CLOUDINARY_*). */
export const uploadResume = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError(401, 'Authentication required');
  if (!req.file?.buffer) throw new AppError(400, 'No file uploaded');

  const result = await uploadByType(req.file.buffer, 'resume');

  let profile = await CandidateProfile.findOne({ userId });
  if (!profile) {
    profile = await CandidateProfile.create({
      userId,
      phone: '',
      headline: '',
      summary: '',
      resumePath: result.secureUrl,
      resumePublicId: result.publicId,
      skills: [],
      experience: [],
      education: [],
    });
  } else {
    if (profile.resumePublicId) {
      try {
        await deleteFromCloudinary(profile.resumePublicId, { resourceType: 'raw' });
      } catch {
        // ignore delete errors
      }
    }
    profile.resumePath = result.secureUrl;
    profile.resumePublicId = result.publicId;
    await profile.save();
  }
  res.status(201).json({
    success: true,
    data: toProfileResponse(profile.toObject() as ICandidateProfile),
  });
});

/** GET resume: redirect to Cloudinary URL if stored there; else serve from disk (legacy). */
export const getResume = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError(401, 'Authentication required');

  const profile = await CandidateProfile.findOne({ userId }).select('resumePath').lean();
  if (!profile?.resumePath) {
    throw new AppError(404, 'No resume uploaded');
  }
  if (profile.resumePath.startsWith('http://') || profile.resumePath.startsWith('https://')) {
    res.redirect(302, profile.resumePath);
    return;
  }
  const absolutePath = path.join(process.cwd(), 'uploads', profile.resumePath);
  if (!fs.existsSync(absolutePath)) {
    throw new AppError(404, 'Resume file not found');
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(absolutePath);
});
