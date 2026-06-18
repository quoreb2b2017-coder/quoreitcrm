import type { Request, Response } from 'express';
import { uploadByType, deleteFromCloudinary } from '../services/uploadService.js';
import { AppError } from '../utils/AppError.js';
import { createRequire } from 'module';
import { cloudinary } from '../config/cloudinary.js';
import { extractPdfText } from '../utils/extractPdfText.js';
const require = createRequire(import.meta.url);

export async function uploadResume(req: Request, res: Response) {
  if (!req.file?.buffer) {
    throw new AppError(400, 'No file uploaded');
  }
  const result = await uploadByType(req.file.buffer, 'resume', { originalname: req.file.originalname });
  res.status(201).json({ success: true, data: result });
}

export async function parseResume(req: Request, res: Response) {
  if (!req.file?.buffer) {
    throw new AppError(400, 'No file uploaded');
  }

  // 1. Upload the resume so we have a URL for the candidate document
  const result = await uploadByType(req.file.buffer, 'resume', { originalname: req.file.originalname });

  // 2. Extract text if it is a PDF
  let text = '';
  try {
    const isPDF = req.file.mimetype === 'application/pdf' ||
      req.file.originalname.toLowerCase().endsWith('.pdf');

    const bufferHeader = req.file.buffer.slice(0, 5).toString();
    console.log('[DEBUG] Parsing file:', req.file.originalname, 'Size:', req.file.buffer?.length, 'Header:', bufferHeader);

    if (isPDF || bufferHeader === '%PDF-') {
      const pdfModule = require('pdf-parse');

      // Try v2 style with PDFParse class if it exists
      if (pdfModule.PDFParse) {
        try {
          console.log('[DEBUG] Trying PDFParse constructor (v2 style)...');
          const parser = new pdfModule.PDFParse({ data: req.file.buffer });
          const result = await parser.getText();
          text = (result?.text || '').trim();
          await parser.destroy();
          if (text) console.log('[DEBUG] v2 extraction success, length:', text.length);
        } catch (err: any) {
          console.error('[DEBUG] v2 style failed:', err.message);
        }
      }

      // Fallback to v1 style if text is still empty and it's a function
      if (!text && typeof pdfModule === 'function') {
        try {
          console.log('[DEBUG] Trying direct function call (v1 style)...');
          const result = await pdfModule(req.file.buffer);
          text = (result?.text || '').trim();
          if (text) console.log('[DEBUG] v1 extraction success, length:', text.length);
        } catch (err: any) {
          console.error('[DEBUG] v1 style failed:', err.message);
        }
      }

      // Final fallback: try extracting from .default if it exists (ESM interop)
      if (!text && pdfModule.default && typeof pdfModule.default === 'function') {
        try {
          console.log('[DEBUG] Trying direct function call on .default...');
          const result = await pdfModule.default(req.file.buffer);
          text = (result?.text || '').trim();
          if (text) console.log('[DEBUG] v1 .default success, length:', text.length);
        } catch (err: any) {
          console.error('[DEBUG] v1 .default failed:', err.message);
        }
      }

    } else {
      console.log('[DEBUG] Non-PDF detected. Fallback to buffer string.');
      text = req.file.buffer.toString('utf-8').slice(0, 50000);
    }
  } catch (err) {
    console.error('[DEBUG] Global parsing exception:', err);
  }

  console.log('[DEBUG] Final extracted text (first 50 chars):', text.slice(0, 50).replace(/\n/g, ' '));

  // 3. Simple extraction logic
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/i;
  const linkedinRegex = /(?:linkedin\.com\/in\/)([a-zA-Z0-9_-]+)/i;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkedinMatch = text.match(linkedinRegex);

  // very basic name guess: first non-empty line
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const guessedName = lines.length > 0 ? lines[0].slice(0, 50) : '';

  const textLower = text.toLowerCase();

  // Extract "real" skills from the resume itself:
  // 1) Prefer a Skills/Tech Stack section (bullets / comma-separated)
  // 2) Fallback to matching a curated dictionary (only if found in text)
  const stop = new Set([
    'and','or','the','a','an','to','of','in','for','on','with','at','by','from','as','is','are','was','were',
    'skills','skill','experience','project','projects','work','summary','education','certifications','tools',
    'framework','frameworks','libraries','library','technologies','technology','tech','stack',
  ]);

  function normalizeSkill(s: string) {
    return s
      .replace(/\s+/g, ' ')
      .replace(/[•·●▪️]/g, ' ')
      .replace(/\s*[-–—]\s*/g, ' ')
      .trim();
  }

  function extractSkillsSection(raw: string): string[] {
    const lines = raw.split(/\r?\n/).map((l) => l.trim());
    const headers = [
      /^skills?$/i,
      /^technical skills?$/i,
      /^tech(nical)? stack$/i,
      /^tools?$/i,
      /^technologies$/i,
    ];
    const startIdx = lines.findIndex((l) => headers.some((h) => h.test(l.replace(/[:•\-–—]+$/g, '').trim())));
    if (startIdx < 0) return [];

    const collected: string[] = [];
    for (let i = startIdx + 1; i < Math.min(lines.length, startIdx + 30); i++) {
      const l = lines[i];
      if (!l) continue;
      // stop when next major header starts
      if (/^(experience|projects?|education|certifications?|summary|achievements?)[:]?$/i.test(l.replace(/[:•\-–—]+$/g, '').trim())) break;
      collected.push(l);
    }

    const chunk = collected.join('\n');
    const parts = chunk
      .split(/[,/|•·●▪️\n]+/g)
      .map((p) => normalizeSkill(p))
      .filter(Boolean);

    return parts;
  }

  const sectionSkills = extractSkillsSection(text);

  const genericBlock = new Set([
    'api',
    'apis',
    'backend',
    'frontend',
    'fullstack',
    'devops',
    'ci/cd',
    'agile',
    'scrum',
    'ai',
    'machine learning',
    'data science',
  ]);

  // If resume has a Skills/Tech Stack section, trust it (no hard-coded list).
  // Otherwise, extract keywords from the text using frequency (lightweight, non-hardcoded).
  function extractKeywordsFromText(raw: string): string[] {
    const tokens = (raw.toLowerCase().match(/[a-z][a-z0-9+.#/-]{1,30}/g) ?? [])
      .map((t) => t.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''))
      .filter(Boolean);

    const isStop = (t: string) => stop.has(t) || genericBlock.has(t);

    const uni = new Map<string, number>();
    for (const t of tokens) {
      if (t.length < 2 || t.length > 30) continue;
      if (isStop(t)) continue;
      uni.set(t, (uni.get(t) ?? 0) + 1);
    }

    // simple bigrams (helps: "rest api", "node js" -> later normalized)
    const bi = new Map<string, number>();
    for (let i = 0; i < tokens.length - 1; i++) {
      const a = tokens[i];
      const b = tokens[i + 1];
      if (isStop(a) || isStop(b)) continue;
      if (a.length < 2 || b.length < 2) continue;
      const phrase = `${a} ${b}`;
      if (genericBlock.has(phrase)) continue;
      bi.set(phrase, (bi.get(phrase) ?? 0) + 1);
    }

    const top = <T extends [string, number]>(m: Map<string, number>, limit: number) =>
      [...m.entries()]
        .sort((x, y) => y[1] - x[1])
        .slice(0, limit)
        .map(([k]) => k);

    const rawKeywords = [...top(bi, 12), ...top(uni, 25)];
    const cleaned = rawKeywords
      .map((s) => normalizeSkill(s))
      .map((s) => s.replace(/^[-–—]\s*/g, ''))
      .map((s) => s.replace(/\s*\(\s*\)\s*/g, '').trim())
      .filter((s) => s.length >= 2 && s.length <= 40)
      .filter((s) => !genericBlock.has(s.toLowerCase()))
      .filter((s) => !stop.has(s.toLowerCase()));

    const seen = new Set<string>();
    return cleaned.filter((s) => {
      const k = s.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  const baseSkills = sectionSkills.length > 0 ? sectionSkills : extractKeywordsFromText(text);

  const foundSkills = baseSkills
    .map((s) => normalizeSkill(s))
    .filter((s) => s.length >= 2 && s.length <= 40)
    .filter((s) => !stop.has(s.toLowerCase()))
    .filter((s) => !genericBlock.has(s.toLowerCase()))
    .slice(0, 30);

  res.status(201).json({
    success: true,
    data: {
      fileUrl: result.secureUrl,
      publicId: result.publicId,
      extracted: {
        name: guessedName,
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        linkedInUrl: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : ''
      },
      text,
      resumeText: text,
      skills: foundSkills
    }
  });
}

/** POST /upload/parse-jd — extract JD text from PDF only (no file storage) */
export async function parseJobDescriptionPdf(req: Request, res: Response) {
  if (!req.file?.buffer) {
    throw new AppError(400, 'No file uploaded');
  }
  const text = await extractPdfText(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype
  );
  if (!text.trim()) {
    throw new AppError(400, 'Could not extract text from this PDF. Try a text-based PDF.');
  }
  res.json({ success: true, data: { text } });
}

export async function uploadDocument(req: Request, res: Response) {
  if (!req.file?.buffer) {
    throw new AppError(400, 'No file uploaded');
  }
  const result = await uploadByType(req.file.buffer, 'document', { originalname: req.file.originalname });
  res.status(201).json({ success: true, data: result });
}

export async function uploadProfilePhoto(req: Request, res: Response) {
  if (!req.file?.buffer) {
    throw new AppError(400, 'No file uploaded');
  }
  const result = await uploadByType(req.file.buffer, 'profile', { originalname: req.file.originalname });
  res.status(201).json({ success: true, data: result });
}

export async function uploadIntroVideo(req: Request, res: Response) {
  if (!req.file?.buffer) {
    throw new AppError(400, 'No file uploaded');
  }
  const result = await uploadByType(req.file.buffer, 'video', { originalname: req.file.originalname });
  res.status(201).json({ success: true, data: result });
}

export async function removeUpload(req: Request, res: Response) {
  const { publicId, resourceType = 'image' } = req.body as {
    publicId?: string;
    resourceType?: 'image' | 'raw' | 'video';
  };
  if (!publicId || typeof publicId !== 'string') {
    throw new AppError(400, 'publicId is required');
  }
  await deleteFromCloudinary(publicId, { resourceType });
  res.json({ success: true, message: 'File removed' });
}

export async function signedUrl(req: Request, res: Response) {
  const publicId = (req.query.publicId as string | undefined) ?? '';
  const resourceType = (req.query.resourceType as 'image' | 'raw' | 'video' | undefined) ?? 'image';
  const deliveryType = (req.query.type as string | undefined) ?? 'upload';
  const formatFromQuery = (req.query.format as string | undefined) ?? undefined;
  const versionRaw = (req.query.version as string | undefined) ?? undefined;
  const forDownload = (req.query.download as string | undefined) === '1';

  if (!publicId) {
    throw new AppError(400, 'publicId is required');
  }

  const version = versionRaw && /^\d+$/.test(versionRaw) ? Number(versionRaw) : undefined;

  const extMatch = publicId.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch?.[1]?.toLowerCase();
  const basePublicId = extMatch ? publicId.slice(0, -1 * (ext!.length + 1)) : publicId;
  const format = formatFromQuery ?? ext;

  // Some Cloudinary accounts enforce signed delivery URLs (401 without signature).
  // IMPORTANT:
  // - sign_url signs transformations, but it does NOT grant access to private/protected assets.
  // - For PDFs/resumes, many Cloudinary setups require a *private download URL* to avoid 401.
  const isDoc =
    (format ?? '').toLowerCase() === 'pdf' ||
    (format ?? '').toLowerCase() === 'doc' ||
    (format ?? '').toLowerCase() === 'docx';

  let url: string;
  if (resourceType !== 'image' || isDoc) {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
    const candidatePublicIds = Array.from(
      new Set([publicId, basePublicId, extMatch ? `${basePublicId}.${ext}` : undefined].filter(Boolean) as string[])
    );
    const candidateResourceTypes: Array<'raw' | 'image'> =
      resourceType === 'raw' ? ['raw', 'image'] : ['image', 'raw'];

    let resolved: { rt: 'raw' | 'image'; pid: string; fmt?: string } | null = null;
    for (const rt of candidateResourceTypes) {
      for (const pid of candidatePublicIds) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await cloudinary.api.resource(pid, { resource_type: rt, type: deliveryType });
          resolved = { rt, pid, fmt: format ?? ext };
          break;
        } catch {
          // keep probing
        }
      }
      if (resolved) break;
    }

    if (!resolved) {
      throw new AppError(404, `Resource not found - ${basePublicId}`);
    }

    const foundExtMatch = resolved.pid.match(/\.([a-z0-9]+)$/i);
    const foundExt = foundExtMatch?.[1]?.toLowerCase();
    const foundBase = foundExtMatch ? resolved.pid.slice(0, -1 * (foundExt!.length + 1)) : resolved.pid;
    const fmt = (formatFromQuery ?? foundExt ?? format ?? ext ?? 'pdf').toLowerCase();

    url = cloudinary.utils.private_download_url(foundBase, fmt, {
      resource_type: resolved.rt,
      type: deliveryType,
      ...(version ? { version } : {}),
      expires_at: expiresAt,
      attachment: forDownload,
    });
  } else {
    url = cloudinary.url(basePublicId, {
      secure: true,
      sign_url: true,
      resource_type: resourceType,
      type: deliveryType,
      ...(format ? { format } : {}),
      ...(version ? { version } : {}),
    });
  }

  res.json({ success: true, data: { url } });
}
