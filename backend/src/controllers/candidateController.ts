import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Candidate } from '../models/Candidate.js';
import { Project } from '../models/Project.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import type { CreateCandidateInput, UpdateCandidateInput } from '../validations/candidateSchemas.js';

function toCandidateResponse(
  c: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    projectId?: mongoose.Types.ObjectId | null;
    jobId?: mongoose.Types.ObjectId | null;
    recruiterId: mongoose.Types.ObjectId;
    isBlocked?: boolean;
    avatar?: string | null;
    avatarPublicId?: string | null;
    resumeUrl?: string | null;
    resumePublicId?: string | null;
    resumeText?: string;
    skills?: string[];
    status?: string;
    experiences?: { title: string; company: string; description?: string; startDate?: string; endDate?: string }[];
    activities?: { type: string; description: string; date: Date }[];
    internalNotes?: { id: number; text: string; date: string; createdAt: number }[];
    createdAt: Date;
    updatedAt: Date;
  },
  projectName?: string | null,
  recruiterName?: string | null,
  jobTitle?: string | null,
  recruiterAvatar?: string | null
) {
  return {
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    phone: c.phone ?? '',
    linkedInUrl: c.linkedInUrl ?? '',
    githubUrl: c.githubUrl ?? '',
    projectId: c.projectId?.toString() ?? null,
    projectName: projectName ?? null,
    jobId: c.jobId?.toString() ?? null,
    jobTitle: jobTitle ?? null,
    recruiterId: c.recruiterId.toString(),
    recruiterName: recruiterName ?? null,
    recruiterAvatar: recruiterAvatar ?? null,
    isBlocked: c.isBlocked ?? false,
    avatar: c.avatar ?? null,
    avatarPublicId: c.avatarPublicId ?? null,
    resumeUrl: (c as any).resumeUrl ?? null,
    resumePublicId: (c as any).resumePublicId ?? null,
    resumeText: (c as any).resumeText ?? '',
    skills: (c as any).skills ?? [],
    status: c.status ?? 'Sourced',
    experiences: c.experiences ?? [],
    activities: c.activities ?? [],
    internalNotes: (c as any).internalNotes ?? [],
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

/** Status groups for filter dropdown and counts */
export const STATUS_GROUPS = {
  activeCandidates: ['Contacted', 'In Play', 'Warm', 'Scheduled Call', 'Sourced', 'Active', 'Warm In Touch', 'In Touch'],
  highlyRated: ['Highly Rated'],
  likelyToRespond: ['Likely to Respond'],
  expressedInterest: ['Expressed Interest'],
} as const;

type StatusGroupKey = keyof typeof STATUS_GROUPS | 'all';

function buildBaseFilter(role: string, userId: string, query: { projectId?: string; jobId?: string; search?: string; location?: string; tags?: string }): Record<string, unknown> {
  const filter: Record<string, unknown> =
    role === 'admin'
      ? {}
      : {
        recruiterId: new mongoose.Types.ObjectId(userId),
        $and: [
          { $or: [{ isBlocked: false }, { isBlocked: { $exists: false } }, { isBlocked: null }] },
        ],
      };
  if (query.projectId) filter.projectId = new mongoose.Types.ObjectId(query.projectId);
  if (query.jobId) filter.jobId = new mongoose.Types.ObjectId(query.jobId);
  if (query.location?.trim()) filter.location = { $regex: query.location.trim(), $options: 'i' };
  if (query.tags?.trim()) {
    const tagsArr = query.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (tagsArr.length > 0) filter.tags = { $all: tagsArr };
  }
  if (query.search?.trim()) {
    const q = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { status: { $regex: q, $options: 'i' } },
      { skills: { $regex: q, $options: 'i' } },
    ];
  }
  return filter;
}

function normalizeLinkedInUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    const host = url.hostname.toLowerCase();
    if (!host.includes('linkedin.com')) return null;
    if (!/^\/(in|pub)\//i.test(url.pathname)) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function readMetaTag(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }
  return '';
}

function pickFirstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function extractJsonScriptBlocks(html: string): any[] {
  const blocks: any[] = [];
  const matches = Array.from(html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi));
  for (const match of matches) {
    const raw = (match[1] ?? '').trim();
    if (!raw) continue;
    const looksJson =
      raw.startsWith('{') ||
      raw.startsWith('[') ||
      raw.startsWith('window.__INITIAL_STATE__=') ||
      raw.startsWith('window.__INITIAL_STATE__ =');
    if (!looksJson) continue;

    const normalized = raw
      .replace(/^window\.__INITIAL_STATE__\s*=\s*/i, '')
      .replace(/;$/, '')
      .trim();
    try {
      const parsed = JSON.parse(normalized);
      blocks.push(parsed);
    } catch {
      // Ignore malformed script blocks
    }
  }
  return blocks;
}

function findFirstStringByKeys(node: any, keys: string[]): string {
  const wanted = new Set(keys.map((k) => k.toLowerCase()));
  const seen = new Set<any>();
  const stack: any[] = [node];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;
    if (seen.has(current)) continue;
    seen.add(current);

    if (Array.isArray(current)) {
      for (const item of current) stack.push(item);
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (typeof value === 'string' && wanted.has(key.toLowerCase()) && value.trim()) {
        return value.trim();
      }
      if (value && typeof value === 'object') stack.push(value);
    }
  }

  return '';
}

function findAllStringByKeys(node: any, keys: string[], max = 12): string[] {
  const wanted = new Set(keys.map((k) => k.toLowerCase()));
  const seen = new Set<any>();
  const stack: any[] = [node];
  const out: string[] = [];

  while (stack.length > 0 && out.length < max) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;
    if (seen.has(current)) continue;
    seen.add(current);

    if (Array.isArray(current)) {
      for (const item of current) stack.push(item);
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (typeof value === 'string' && wanted.has(key.toLowerCase()) && value.trim()) {
        out.push(value.trim());
        if (out.length >= max) break;
      } else if (value && typeof value === 'object') {
        stack.push(value);
      }
    }
  }

  return Array.from(new Set(out.map((x) => x.trim()).filter(Boolean)));
}

function extractLinkedInTextSections(rawText: string): {
  name?: string;
  pronouns?: string;
  headline?: string;
  currentCompany?: string;
  location?: string;
  followers?: string;
  connections?: string;
  about?: string;
  skills: string[];
  experiences: { title: string; company: string; startDate?: string; endDate?: string; description?: string }[];
} {
  const text = String(rawText ?? '').replace(/\r/g, '');
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const getFirstMatch = (pattern: RegExp): string => {
    const m = text.match(pattern);
    return m?.[1]?.trim() || '';
  };

  const followers = getFirstMatch(/([0-9][0-9,+.]*)\s+followers/i);
  const connections = getFirstMatch(/([0-9][0-9,+.]*(?:\+)?)\s+connections/i);
  const pronouns = lines.find((l) => /^(he\/him|she\/her|they\/them|he him|she her|they them)$/i.test(l)) || '';

  let name = '';
  let headline = '';
  let currentCompany = '';
  if (pronouns) {
    const idx = lines.findIndex((l) => l === pronouns);
    if (idx > 0) name = lines[idx - 1] || '';
    if (idx >= 0) headline = lines[idx + 1] || '';
    if (idx >= 0) currentCompany = lines[idx + 2] || '';
  }

  const locationFromLine = lines.find((l) => /india|usa|united states|uk|canada|australia|division|city|state/i.test(l) && /contact info/i.test(l))
    ?.replace(/\s*Contact info.*$/i, '')
    .trim() || '';

  const about = (() => {
    const m = text.match(/(?:^|\n)About(?:About)?\s*([\s\S]*?)(?:\nTop skills|\nFeatured|\nActivity|\nExperience|\nEducation|\nLicenses|\nProjects|\nSkills)/i);
    if (!m?.[1]) return '';
    return m[1]
      .replace(/\n{2,}/g, '\n')
      .replace(/\s{2,}/g, ' ')
      .trim();
  })();

  const skills = (() => {
    const skillBlock = text.match(/(?:^|\n)Top skills(?:Top skills)?\s*([\s\S]*?)(?:\nFeatured|\nActivity|\nExperience|\nEducation|\nLicenses|\nProjects|\nRecommendations)/i)?.[1] || '';
    if (!skillBlock) return [];
    return Array.from(new Set(
      skillBlock
        .split(/[\n•|,]+/g)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2 && s.length <= 50)
        .filter((s) => !/top skills|show all|skills/i.test(s))
    )).slice(0, 20);
  })();

  const experiences = (() => {
    const block = text.match(/(?:^|\n)Experience(?:Experience)?\s*([\s\S]*?)(?:\nEducation|\nLicenses|\nProjects|\nSkills|\nRecommendations)/i)?.[1] || '';
    if (!block) return [];
    const expLines = block
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !/logo$/i.test(l) && !/^Show all/i.test(l));
    const result: { title: string; company: string; startDate?: string; endDate?: string; description?: string }[] = [];
    for (let i = 0; i < expLines.length - 1 && result.length < 12; i++) {
      const title = expLines[i];
      const company = expLines[i + 1];
      if (!title || !company) continue;
      if (/^\d/.test(title) || /full-time|internship|mos|yrs|present/i.test(title)) continue;
      if (/^\d/.test(company) || /full-time|internship|mos|yrs/i.test(company)) continue;
      if (/experience|show all/i.test(title) || /experience|show all/i.test(company)) continue;
      const dateLine = expLines[i + 2] || '';
      const dateMatch = dateLine.match(/([A-Za-z]{3,9}\s+\d{4})\s*-\s*(Present|[A-Za-z]{3,9}\s+\d{4})/i);
      result.push({
        title,
        company,
        startDate: dateMatch?.[1],
        endDate: dateMatch?.[2],
      });
    }
    return Array.from(new Map(result.map((r) => [`${r.title}__${r.company}`, r])).values()).slice(0, 8);
  })();

  return {
    name: name || undefined,
    pronouns: pronouns || undefined,
    headline: headline || undefined,
    currentCompany: currentCompany || undefined,
    location: locationFromLine || undefined,
    followers: followers || undefined,
    connections: connections || undefined,
    about: about || undefined,
    skills,
    experiences,
  };
}

async function fetchViaProxycurl(profileUrl: string): Promise<{
  name?: string;
  pronouns?: string;
  headline?: string;
  about?: string;
  avatarUrl?: string;
  location?: string;
  currentCompany?: string;
  followers?: string;
  connections?: string;
  experiences: { title: string; company: string; startDate?: string; endDate?: string; description?: string }[];
  skills: string[];
} | null> {
  const apiKey = process.env.PROXYCURL_API_KEY?.trim();
  if (!apiKey) return null;

  const endpoint = new URL('https://nubela.co/proxycurl/api/v2/linkedin');
  endpoint.searchParams.set('url', profileUrl);
  endpoint.searchParams.set('use_cache', 'if-present');

  const res = await fetch(endpoint.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!res.ok) {
    if (res.status === 410) {
      // Proxycurl sunset – return null to allow other fallbacks, and let upstream show a meaningful message.
      return null;
    }
    return null;
  }
  const data = await res.json() as any;
  if (!data || typeof data !== 'object') return null;

  const experiences = (Array.isArray(data.experiences) ? data.experiences : [])
    .map((x: any) => ({
      title: String(x?.title ?? '').trim(),
      company: String(x?.company ?? '').trim(),
      startDate: String(x?.starts_at ? [x.starts_at.month, x.starts_at.year].filter(Boolean).join('/') : '').trim() || undefined,
      endDate: String(x?.ends_at ? [x.ends_at.month, x.ends_at.year].filter(Boolean).join('/') : '').trim() || (x?.is_current ? 'Present' : undefined),
      description: String(x?.description ?? '').trim() || undefined,
    }))
    .filter((x: any) => x.title && x.company)
    .slice(0, 15);

  const normalizedSkills = (Array.isArray(data.skills) ? (data.skills as any[]) : [])
    .map((s) => String(s).trim())
    .filter((s) => s.length >= 2 && s.length <= 50);
  const skills: string[] = Array.from(new Set(normalizedSkills)).slice(0, 25);

  const location = [data.city, data.state, data.country_full_name].filter(Boolean).join(', ').trim();
  const currentCompany = Array.isArray(data.experiences) && data.experiences.length > 0
    ? String(data.experiences[0]?.company ?? '').trim()
    : '';

  return {
    name: String(data.full_name ?? '').trim() || undefined,
    pronouns: String(data.gender ?? '').trim() || undefined,
    headline: String(data.occupation ?? '').trim() || undefined,
    about: String(data.summary ?? '').trim() || undefined,
    avatarUrl: String(data.profile_pic_url ?? '').trim() || undefined,
    location: location || undefined,
    currentCompany: currentCompany || undefined,
    followers: (data.follower_count != null ? String(data.follower_count) : undefined),
    connections: (data.connections != null ? String(data.connections) : undefined),
    experiences,
    skills,
  };
}

async function fetchViaApify(profileUrl: string): Promise<{
  name?: string;
  pronouns?: string;
  headline?: string;
  about?: string;
  avatarUrl?: string;
  location?: string;
  currentCompany?: string;
  followers?: string;
  connections?: string;
  experiences: { title: string; company: string; startDate?: string; endDate?: string; description?: string }[];
  skills: string[];
} | null> {
  const token = process.env.APIFY_TOKEN?.trim();
  const actorId = process.env.APIFY_LINKEDIN_ACTOR_ID?.trim();
  if (!token || !actorId) return null;

  const url = new URL(`https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('clean', 'true');
  url.searchParams.set('limit', '5');

  // The actor input key names vary across different LinkedIn scrapers.
  // We start with the most common one shown in many actors: `linkedinProfileUrls: []`.
  const inputCandidates: Array<Record<string, any>> = [
    { linkedinProfileUrls: [profileUrl] },
    { linkedinProfileUrl: profileUrl },
    { linkedin_profile_urls: [profileUrl] },
    { urls: [profileUrl] },
    { url: profileUrl },
  ];

  let lastError: string | undefined;
  for (const input of inputCandidates) {
    try {
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        if (res.status === 403) {
          const body = await res.json().catch(() => null) as any;
          const type = body?.error?.type;
          const msg = body?.error?.message;
          if (type === 'actor-is-not-rented' && msg) {
            throw new AppError(
              400,
              `Apify actor not rented: ${msg}`
            );
          }
        }
        lastError = `Apify HTTP ${res.status}`;
        continue;
      }
      const items = (await res.json()) as any[];
      if (!Array.isArray(items) || items.length === 0) continue;

      const item = items[0] ?? {};

      const toStringArray = (v: any): string[] => {
        if (Array.isArray(v)) {
          return Array.from(
            new Set(
              v
                .map((x) => {
                  if (typeof x === 'string') return x;
                  if (x && typeof x === 'object') return String(x.name ?? x.value ?? '').trim();
                  return '';
                })
                .filter(Boolean)
            )
          );
        }
        return [];
      };

      const skillsRaw = item.skills ?? item.topSkills ?? item.skill ?? item.skillNames ?? [];
      const skills = toStringArray(skillsRaw).slice(0, 25);

      const experiencesRaw = item.experiences ?? item.experience ?? item.works ?? item.workExperience ?? [];
      const mappedExperiences: Array<{ title: string; company: string; startDate?: string; endDate?: string; description?: string } | null> =
        Array.isArray(experiencesRaw)
          ? experiencesRaw.map((x: any) => {
              const title = String(x?.title ?? x?.role ?? x?.position ?? '').trim();
              const company = String(x?.company ?? x?.organization ?? x?.org ?? '').trim();
              if (!title || !company) return null;
              const startDate = x?.startDate ?? x?.startsAt ?? x?.starts_at;
              const endDate = x?.endDate ?? x?.endsAt ?? x?.ends_at ?? (x?.isCurrent ? 'Present' : undefined);
              const description = x?.description ?? x?.summary;
              return {
                title,
                company,
                startDate: startDate ? String(startDate) : undefined,
                endDate: endDate ? String(endDate) : undefined,
                description: description ? String(description) : undefined,
              };
            })
          : [];
      const experiences = mappedExperiences
        .filter((x): x is { title: string; company: string; startDate?: string; endDate?: string; description?: string } => x !== null)
        .slice(0, 12);

      const name = pickFirstNonEmpty(
        item.fullName ?? item.name ?? item.profileName,
        findFirstStringByKeys(item, ['fullName', 'name', 'displayName', 'formattedName'])
      );

      const headline = pickFirstNonEmpty(
        item.headline ?? item.occupation ?? item.tagline ?? item.title,
        findFirstStringByKeys(item, ['headline', 'occupation', 'tagline', 'title'])
      );

      const about = pickFirstNonEmpty(
        item.about ?? item.summary ?? item.bio ?? '',
        findFirstStringByKeys(item, ['about', 'summary', 'bio'])
      );

      const avatarUrl = pickFirstNonEmpty(
        item.profilePictureUrl ?? item.profilePicture ?? item.avatarUrl ?? item.avatar ?? '',
        findFirstStringByKeys(item, ['profilePicture', 'picture', 'imageUrl', 'avatar'])
      );

      const location = pickFirstNonEmpty(
        item.location ?? item.locationName ?? item.city ?? '',
        findFirstStringByKeys(item, ['locationName', 'geoLocationName', 'location', 'city'])
      );

      const followers = item.followersCount ?? item.followers ?? item.followerCount ?? '';
      const connections = item.connectionsCount ?? item.connections ?? item.connectionCount ?? '';

      return {
        name: name || undefined,
        pronouns: item.pronouns ?? item.gender ?? undefined,
        headline: headline || undefined,
        about: about || undefined,
        avatarUrl: avatarUrl || undefined,
        location: location || undefined,
        currentCompany: item.currentCompany ?? item.current_employer ?? undefined,
        followers: followers ? String(followers) : undefined,
        connections: connections ? String(connections) : undefined,
        experiences,
        skills,
      };
    } catch (e: any) {
      lastError = e?.message ?? lastError;
    }
  }

  return null;
}

async function scrapePublicLinkedInProfile(profileUrl: string): Promise<{
  name?: string;
  pronouns?: string;
  headline?: string;
  about?: string;
  avatarUrl?: string;
  location?: string;
  currentCompany?: string;
  followers?: string;
  connections?: string;
  experiences: { title: string; company: string; startDate?: string; endDate?: string; description?: string }[];
  skills: string[];
}> {
  // 1) Apify (most reliable for full public data)
  const apifyData = await fetchViaApify(profileUrl);
  if (apifyData && (apifyData.name || apifyData.headline || apifyData.about || apifyData.skills.length || apifyData.experiences.length)) {
    return apifyData;
  }

  const proxycurlData = await fetchViaProxycurl(profileUrl);
  if (proxycurlData) return proxycurlData;

  const requestOptions: RequestInit = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    redirect: 'follow',
  };

  const fetchHtml = async (url: string): Promise<string> => {
    const res = await fetch(url, requestOptions);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  };

  let html = '';
  let lastError = '';
  try {
    html = await fetchHtml(profileUrl);
  } catch (error: any) {
    lastError = error?.message || 'Unknown error';
    // Fallback through jina.ai mirror (helps when direct LinkedIn fetch is blocked)
    const withoutProtocol = profileUrl.replace(/^https?:\/\//i, '');
    const mirrorUrl = `https://r.jina.ai/http://${withoutProtocol}`;
    try {
      html = await fetchHtml(mirrorUrl);
    } catch (mirrorError: any) {
      lastError = `${lastError}; fallback: ${mirrorError?.message || 'Unknown error'}`;
    }
  }

  if (!html) {
    throw new AppError(400, `LinkedIn fetch failed: ${lastError || 'Unable to download profile page'}`);
  }
  if (!html || html.length < 200) {
    throw new AppError(400, 'LinkedIn profile page is empty or blocked');
  }
  if (/error\s*999/i.test(html) || /sign in to linkedin/i.test(html)) {
    throw new AppError(
      400,
      'LinkedIn blocked public scraping from server network. Configure PROXYCURL_API_KEY in backend .env for reliable public profile extraction.'
    );
  }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const titleText = decodeHtmlEntities((titleMatch?.[1] ?? '').trim());
  const ogTitle = readMetaTag(html, 'og:title');
  const ogDescription = readMetaTag(html, 'og:description');
  const ogImage = readMetaTag(html, 'og:image');

  let name = '';
  const titleSource = ogTitle || titleText;
  if (titleSource) {
    name = titleSource
      .replace(/\s*\|\s*LinkedIn.*$/i, '')
      .replace(/\s*-\s*LinkedIn.*$/i, '')
      .trim();
  }

  const ldJsonMatches = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  const jsonLdItems: any[] = [];
  for (const m of ldJsonMatches) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) jsonLdItems.push(...parsed);
      else jsonLdItems.push(parsed);
    } catch {
      // Ignore non-JSON blocks
    }
  }

  const person = jsonLdItems.find((item) => {
    const t = item?.['@type'];
    if (Array.isArray(t)) return t.includes('Person');
    return t === 'Person';
  });

  const scriptJsonBlocks = extractJsonScriptBlocks(html);
  const mergedScriptData = { ld: jsonLdItems, scripts: scriptJsonBlocks };

  const regexValue = (pattern: RegExp): string => {
    const m = html.match(pattern);
    return m?.[1] ? decodeHtmlEntities(m[1]).trim() : '';
  };

  const firstNameFromRegex = regexValue(/"firstName"\s*:\s*"([^"]+)"/i);
  const lastNameFromRegex = regexValue(/"lastName"\s*:\s*"([^"]+)"/i);
  const fullNameFromRegex = `${firstNameFromRegex} ${lastNameFromRegex}`.trim();
  const headlineFromRegex = regexValue(/"headline"\s*:\s*"([^"]+)"/i);
  const locationFromRegex =
    regexValue(/"locationName"\s*:\s*"([^"]+)"/i) ||
    regexValue(/"geoLocationName"\s*:\s*"([^"]+)"/i);

  const personName =
    typeof person?.name === 'string'
      ? person.name.trim()
      : '';
  const nameFromScripts = pickFirstNonEmpty(
    findFirstStringByKeys(mergedScriptData, ['fullName', 'name', 'displayName', 'formattedName']),
    fullNameFromRegex
  );
  name = pickFirstNonEmpty(name, personName, nameFromScripts);
  if (!name) {
    const slug = profileUrl.match(/linkedin\.com\/(?:in|pub)\/([^/?#]+)/i)?.[1] ?? '';
    const fromSlug = decodeURIComponent(slug)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (ch) => ch.toUpperCase())
      .trim();
    name = fromSlug;
  }

  const headline = pickFirstNonEmpty(
    typeof person?.description === 'string' ? person.description : '',
    findFirstStringByKeys(mergedScriptData, ['headline', 'occupation', 'tagline']),
    headlineFromRegex,
    ogDescription
  );

  let avatarUrl = '';
  if (typeof person?.image === 'string') avatarUrl = person.image;
  else if (person?.image?.url && typeof person.image.url === 'string') avatarUrl = person.image.url;
  if (!avatarUrl) {
    avatarUrl = pickFirstNonEmpty(
      findFirstStringByKeys(mergedScriptData, ['profilePicture', 'picture', 'imageUrl', 'displayImage']),
      ogImage
    );
  }

  const locationCandidates = [
    readMetaTag(html, 'profile:locality'),
    readMetaTag(html, 'og:locality'),
    typeof person?.homeLocation?.name === 'string' ? person.homeLocation.name : '',
    typeof person?.address?.addressLocality === 'string' ? person.address.addressLocality : '',
    findFirstStringByKeys(mergedScriptData, ['locationName', 'geoLocationName', 'location', 'city']),
    locationFromRegex,
  ].map((x) => x.trim()).filter(Boolean);
  const location = locationCandidates[0] ?? '';

  const maybeCompany =
    typeof person?.worksFor?.name === 'string'
      ? person.worksFor.name
      : typeof person?.worksFor?.[0]?.name === 'string'
        ? person.worksFor[0].name
        : '';
  const experiences = name && headline && maybeCompany
    ? [{ title: headline, company: maybeCompany }]
    : [];

  const skillsFromHeadline = headline
    .split(/[|,•·]/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 40);
  const skillsFromScripts = findAllStringByKeys(mergedScriptData, ['skill', 'name'], 20)
    .filter((s) => s.length >= 2 && s.length <= 40)
    .filter((s) => !/linkedin|profile|view|sign in|join now/i.test(s));
  const skills = Array.from(new Set([...skillsFromHeadline, ...skillsFromScripts])).slice(0, 12);

  const textExtract = extractLinkedInTextSections(html);
  const mergedExperiences =
    textExtract.experiences.length > 0
      ? textExtract.experiences
      : experiences;
  const mergedSkills = Array.from(new Set([...(skills || []), ...(textExtract.skills || [])])).slice(0, 20);

  return {
    name: pickFirstNonEmpty(name, textExtract.name) || undefined,
    pronouns: textExtract.pronouns,
    headline: pickFirstNonEmpty(headline, textExtract.headline) || undefined,
    about: pickFirstNonEmpty(ogDescription, textExtract.about) || undefined,
    avatarUrl: avatarUrl || undefined,
    location: pickFirstNonEmpty(location, textExtract.location) || undefined,
    currentCompany: textExtract.currentCompany,
    followers: textExtract.followers,
    connections: textExtract.connections,
    experiences: mergedExperiences,
    skills: mergedSkills,
  };
}

/** List candidates: recruiter = own, admin = all; optional statusGroup filter + counts */
export const list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const role = req.user?.role;
  const userId = req.user?.userId;
  if (!userId) throw new AppError(401, 'Authentication required');

  const query = req.query as { page?: string; limit?: string; search?: string; projectId?: string; jobId?: string; statusGroup?: string; location?: string; tags?: string };
  const page = Math.max(1, parseInt(query.page ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));
  const skip = (page - 1) * limit;
  const statusGroup = (query.statusGroup === 'all' || !query.statusGroup ? 'all' : query.statusGroup) as StatusGroupKey;

  const baseFilter = buildBaseFilter(role ?? '', userId, query);
  
  // If searching, also find matching projects and jobs to include candidates assigned to them
  if (query.search?.trim()) {
    const q = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const [matchingProjects, matchingJobs] = await Promise.all([
      Project.find({ name: { $regex: q, $options: 'i' } }).select('_id').lean(),
      Job.find({ title: { $regex: q, $options: 'i' } }).select('_id').lean(),
    ]);

    if (baseFilter.$or && Array.isArray(baseFilter.$or)) {
      if (matchingProjects.length > 0) {
        (baseFilter.$or as any[]).push({ projectId: { $in: matchingProjects.map(p => p._id) } });
      }
      if (matchingJobs.length > 0) {
        (baseFilter.$or as any[]).push({ jobId: { $in: matchingJobs.map(j => j._id) } });
      }
    }
  }

  const filter: Record<string, unknown> = { ...baseFilter };
  if (statusGroup !== 'all' && statusGroup in STATUS_GROUPS) {
    filter.status = { $in: [...STATUS_GROUPS[statusGroup as keyof typeof STATUS_GROUPS]] };
  }

  const [items, total, countsResult] = await Promise.all([
    Candidate.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('projectId', 'name').populate('jobId', 'title').populate('recruiterId', 'name avatar').lean(),
    Candidate.countDocuments(filter),
    Candidate.aggregate<{ all: [{ c: number }]; activeCandidates: [{ c: number }]; highlyRated: [{ c: number }]; likelyToRespond: [{ c: number }]; expressedInterest: [{ c: number }] }>([
      { $match: baseFilter },
      {
        $facet: {
          all: [{ $count: 'c' }],
          activeCandidates: [{ $match: { status: { $in: STATUS_GROUPS.activeCandidates } } }, { $count: 'c' }],
          highlyRated: [{ $match: { status: { $in: STATUS_GROUPS.highlyRated } } }, { $count: 'c' }],
          likelyToRespond: [{ $match: { status: { $in: STATUS_GROUPS.likelyToRespond } } }, { $count: 'c' }],
          expressedInterest: [{ $match: { status: { $in: STATUS_GROUPS.expressedInterest } } }, { $count: 'c' }],
        },
      },
    ]),
  ]);

  const facet = countsResult[0];
  const counts = {
    all: facet?.all?.[0]?.c ?? 0,
    activeCandidates: facet?.activeCandidates?.[0]?.c ?? 0,
    highlyRated: facet?.highlyRated?.[0]?.c ?? 0,
    likelyToRespond: facet?.likelyToRespond?.[0]?.c ?? 0,
    expressedInterest: facet?.expressedInterest?.[0]?.c ?? 0,
  };

  const data = items.map((c) => {
    const doc = c as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
      phone?: string;
      linkedInUrl?: string;
      githubUrl?: string;
      projectId?: { _id: mongoose.Types.ObjectId; name: string } | null;
      jobId?: { _id: mongoose.Types.ObjectId; title: string } | null;
      recruiterId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; avatar?: string };
      avatar?: string | null;
      avatarPublicId?: string | null;
      status?: string;
      createdAt: Date;
      updatedAt: Date;
    };
    const projectName = doc.projectId && typeof doc.projectId === 'object' && 'name' in doc.projectId ? doc.projectId.name : null;
    const jobTitle = doc.jobId && typeof doc.jobId === 'object' && 'title' in doc.jobId ? doc.jobId.title : null;
    const recruiterIdRaw = doc.recruiterId;
    const recruiterId = typeof recruiterIdRaw === 'object' && recruiterIdRaw && '_id' in recruiterIdRaw ? recruiterIdRaw._id : recruiterIdRaw;
    const recruiterName = typeof recruiterIdRaw === 'object' && recruiterIdRaw && 'name' in recruiterIdRaw ? recruiterIdRaw.name : null;
    const recruiterAvatar = typeof recruiterIdRaw === 'object' && recruiterIdRaw && 'avatar' in recruiterIdRaw ? (recruiterIdRaw as { avatar?: string }).avatar : null;
    const jobIdPlain = doc.jobId && typeof doc.jobId === 'object' && '_id' in doc.jobId ? doc.jobId._id : (doc as { jobId?: mongoose.Types.ObjectId }).jobId;
    return toCandidateResponse(
      { ...doc, projectId: doc.projectId && typeof doc.projectId === 'object' && '_id' in doc.projectId ? doc.projectId._id : null, jobId: jobIdPlain ?? null, recruiterId },
      projectName,
      recruiterName,
      jobTitle,
      recruiterAvatar
    );
  });

  res.json({
    success: true,
    data: {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counts,
    },
  });
});

/** Create candidate – image not required; can add/update later */
export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateCandidateInput;
  const userId = req.user?.userId;
  if (!userId) throw new AppError(401, 'Authentication required');

  if (body.projectId) {
    const project = await Project.findById(body.projectId).select('recruiterId').lean();
    if (!project) throw new AppError(404, 'Project not found');
    if (req.user?.role !== 'admin' && project.recruiterId.toString() !== userId) {
      throw new AppError(403, 'You can only assign your own projects to candidates');
    }
  }

  if (body.jobId) {
    const job = await Job.findById(body.jobId).select('recruiterIds').lean();
    if (!job) throw new AppError(404, 'Job not found');
    if (req.user?.role !== 'admin') {
      const recIds = Array.isArray((job as any).recruiterIds)
        ? (job as any).recruiterIds.map((id: any) => id.toString())
        : [];
      if (!recIds.includes(userId)) {
        throw new AppError(403, 'You can only assign candidates to jobs assigned to you');
      }
    }
  }

  const emailLower = body.email.trim().toLowerCase();
  const existingCandidate = await Candidate.findOne({
    email: emailLower,
    recruiterId: new mongoose.Types.ObjectId(userId),
  }).select('_id').lean();
  if (existingCandidate) {
    throw new AppError(409, 'A candidate with this email already exists in your list');
  }

  const candidate = await Candidate.create({
    name: body.name.trim(),
    email: emailLower,
    phone: body.phone?.trim() ?? '',
    linkedInUrl: body.linkedInUrl?.trim() ?? '',
    githubUrl: body.githubUrl?.trim() ?? '',
    projectId: body.projectId ? new mongoose.Types.ObjectId(body.projectId) : null,
    jobId: body.jobId ? new mongoose.Types.ObjectId(body.jobId) : null,
    recruiterId: new mongoose.Types.ObjectId(userId),
    status: body.status?.trim() ?? 'Sourced',
    avatar: null,
    avatarPublicId: null,
    resumeUrl: body.resumeUrl ?? null,
    resumePublicId: body.resumePublicId ?? null,
    resumeText: body.resumeText ?? '',
    skills: body.skills ?? [],
  });
  console.log('[DEBUG] Candidate created with resumeText, length:', (candidate.resumeText || '').length);

  if (body.jobId) {
    const jobOid = new mongoose.Types.ObjectId(body.jobId);
    const existingApp = await Application.findOne({
      jobId: jobOid,
      crmCandidateId: candidate._id,
    }).select('_id').lean();
    if (!existingApp) {
      await Application.create({
        jobId: jobOid,
        crmCandidateId: candidate._id,
        status: 'applied',
      });
    }
  }

  const withPopulate = await Candidate.findById(candidate._id).populate('projectId', 'name').populate('jobId', 'title').populate('recruiterId', 'name').lean();
  const doc = withPopulate as unknown as { projectId?: { name: string } | null; jobId?: { title: string } | null; recruiterId?: { _id: mongoose.Types.ObjectId; name: string } };
  const projectName = doc.projectId && typeof doc.projectId === 'object' && 'name' in doc.projectId ? doc.projectId.name : null;
  const jobTitle = doc.jobId && typeof doc.jobId === 'object' && 'title' in doc.jobId ? doc.jobId.title : null;
  const recruiterName = doc.recruiterId && typeof doc.recruiterId === 'object' && 'name' in doc.recruiterId ? doc.recruiterId.name : null;

  res.status(201).json({
    success: true,
    data: toCandidateResponse(candidate, projectName, recruiterName, jobTitle),
  });
});

/** Get one candidate – recruiter own only (and not blocked), admin any */
export const getOne = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId) throw new AppError(401, 'Authentication required');

  const candidate = await Candidate.findById(id).populate('projectId', 'name').populate('jobId', 'title').populate('recruiterId', 'name').lean();
  if (!candidate) throw new AppError(404, 'Candidate not found');

  const isBlocked = (candidate as { isBlocked?: boolean }).isBlocked === true;
  if (role === 'recruiter' && isBlocked) {
    throw new AppError(403, 'You do not have access to this candidate');
  }

  const recruiterIdRaw = (candidate as { recruiterId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId } }).recruiterId;
  const recruiterIdStr = typeof recruiterIdRaw === 'object' && recruiterIdRaw && '_id' in recruiterIdRaw ? recruiterIdRaw._id.toString() : (recruiterIdRaw as mongoose.Types.ObjectId).toString();
  if (role !== 'admin' && recruiterIdStr !== userId) {
    throw new AppError(403, 'You can only view your own candidates');
  }

  const doc = candidate as unknown as { projectId?: { name: string } | null; jobId?: { _id: mongoose.Types.ObjectId; title: string } | null; recruiterId?: { _id: mongoose.Types.ObjectId; name: string } };
  const projectName = doc.projectId && typeof doc.projectId === 'object' && 'name' in doc.projectId ? doc.projectId.name : null;
  const jobTitle = doc.jobId && typeof doc.jobId === 'object' && 'title' in doc.jobId ? doc.jobId.title : null;
  const recruiterName = doc.recruiterId && typeof doc.recruiterId === 'object' && 'name' in doc.recruiterId ? doc.recruiterId.name : null;

  res.json({
    success: true,
    data: toCandidateResponse(
      { ...candidate, recruiterId: typeof doc.recruiterId === 'object' && doc.recruiterId ? doc.recruiterId._id : (candidate as { recruiterId: mongoose.Types.ObjectId }).recruiterId } as any,
      projectName,
      recruiterName,
      jobTitle
    ),
  });
});

/** Update candidate – optional fields; image optional (upload via /upload/profile-photo then send avatar + avatarPublicId) */
export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const body = req.body as UpdateCandidateInput;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId) throw new AppError(401, 'Authentication required');

  const candidate = await Candidate.findById(id).lean();
  if (!candidate) throw new AppError(404, 'Candidate not found');

  if (role !== 'admin' && (candidate as { recruiterId: mongoose.Types.ObjectId }).recruiterId.toString() !== userId) {
    throw new AppError(403, 'You can only update your own candidates');
  }

  const updateFields: Record<string, unknown> = {};
  if (body.name !== undefined) updateFields.name = body.name.trim();
  if (body.email !== undefined) updateFields.email = body.email.trim().toLowerCase();
  if (body.phone !== undefined) updateFields.phone = body.phone.trim();
  if (body.linkedInUrl !== undefined) updateFields.linkedInUrl = body.linkedInUrl?.trim() ?? '';
  if (body.githubUrl !== undefined) updateFields.githubUrl = body.githubUrl?.trim() ?? '';
  if (body.projectId !== undefined) updateFields.projectId = body.projectId ? new mongoose.Types.ObjectId(body.projectId) : null;
  if (body.jobId !== undefined) updateFields.jobId = body.jobId ? new mongoose.Types.ObjectId(body.jobId) : null;
  if (body.status !== undefined) updateFields.status = body.status.trim();
  if (body.avatar !== undefined) updateFields.avatar = body.avatar ?? null;
  if (body.avatarPublicId !== undefined) updateFields.avatarPublicId = body.avatarPublicId ?? null;
  if (body.experiences !== undefined) updateFields.experiences = body.experiences;
  if ((body as any).internalNotes !== undefined) updateFields.internalNotes = (body as any).internalNotes;
  if (body.resumeUrl !== undefined) updateFields.resumeUrl = body.resumeUrl ?? null;
  if (body.resumePublicId !== undefined) updateFields.resumePublicId = body.resumePublicId ?? null;
  if (body.resumeText !== undefined) {
    updateFields.resumeText = body.resumeText ?? '';
    console.log('[DEBUG] Updating candidate resumeText, length:', (body.resumeText ?? '').length);
  }
  if (body.skills !== undefined) updateFields.skills = body.skills ?? [];
  if (body.activities !== undefined) {
    updateFields.activities = body.activities;
  } else {
    type ActivityEntry = { type: string; description: string; date: Date };
    const baseActs: ActivityEntry[] = Array.isArray((candidate as { activities?: ActivityEntry[] }).activities)
      ? [...(candidate as { activities: ActivityEntry[] }).activities]
      : [];
    const nextActs = [...baseActs];
    let touched = false;

    if (body.resumeUrl !== undefined || body.resumePublicId !== undefined) {
      const oldUrl = String((candidate as { resumeUrl?: string | null }).resumeUrl ?? '');
      const oldPid = String((candidate as { resumePublicId?: string | null }).resumePublicId ?? '');
      const newUrl = body.resumeUrl !== undefined ? String(body.resumeUrl ?? '') : oldUrl;
      const newPid = body.resumePublicId !== undefined ? String(body.resumePublicId ?? '') : oldPid;
      const urlChanged = body.resumeUrl !== undefined && newUrl !== oldUrl;
      const pidChanged = body.resumePublicId !== undefined && newPid !== oldPid;
      if ((urlChanged || pidChanged) && (newUrl.length > 0 || newPid.length > 0)) {
        nextActs.push({
          type: 'resume_update',
          description: 'Resume file added or updated',
          date: new Date(),
        });
        touched = true;
      }
    }

    if (body.status !== undefined) {
      const previousStatus = String((candidate as { status?: string }).status ?? '').trim();
      const nextStatus = body.status.trim();
      if (nextStatus && previousStatus !== nextStatus) {
        nextActs.push({
          type: 'status_update',
          description: `Status changed from ${previousStatus || 'N/A'} to ${nextStatus}`,
          date: new Date(),
        });
        touched = true;
      }
    }

    const oldEmail = String((candidate as { email?: string }).email ?? '').trim().toLowerCase();
    const newEmail = body.email !== undefined ? String(body.email).trim().toLowerCase() : oldEmail;
    if (body.email !== undefined && newEmail && newEmail !== oldEmail) {
      nextActs.push({
        type: 'details_update',
        description: `Email updated from ${oldEmail || 'N/A'} to ${newEmail}`,
        date: new Date(),
      });
      touched = true;
    }

    const oldPhone = String((candidate as { phone?: string }).phone ?? '').trim();
    const newPhone = body.phone !== undefined ? String(body.phone).trim() : oldPhone;
    if (body.phone !== undefined && newPhone !== oldPhone) {
      nextActs.push({
        type: 'details_update',
        description: `Phone updated from ${oldPhone || 'N/A'} to ${newPhone || 'N/A'}`,
        date: new Date(),
      });
      touched = true;
    }

    const oldLinkedIn = String((candidate as { linkedInUrl?: string }).linkedInUrl ?? '').trim();
    const newLinkedIn = body.linkedInUrl !== undefined ? String(body.linkedInUrl ?? '').trim() : oldLinkedIn;
    if (body.linkedInUrl !== undefined && newLinkedIn !== oldLinkedIn) {
      nextActs.push({
        type: 'details_update',
        description: newLinkedIn ? 'LinkedIn URL updated' : 'LinkedIn URL removed',
        date: new Date(),
      });
      touched = true;
    }

    const oldGithub = String((candidate as { githubUrl?: string }).githubUrl ?? '').trim();
    const newGithub = body.githubUrl !== undefined ? String(body.githubUrl ?? '').trim() : oldGithub;
    if (body.githubUrl !== undefined && newGithub !== oldGithub) {
      nextActs.push({
        type: 'details_update',
        description: newGithub ? 'GitHub URL updated' : 'GitHub URL removed',
        date: new Date(),
      });
      touched = true;
    }

    if (touched) updateFields.activities = nextActs;
  }
  if (body.isBlocked !== undefined) {
    if (role !== 'admin') throw new AppError(403, 'Only admin can block or unblock candidates');
    updateFields.isBlocked = !!body.isBlocked;
  }

  const updated = await Candidate.findByIdAndUpdate(id, updateFields, { new: true }).populate('projectId', 'name').populate('jobId', 'title').populate('recruiterId', 'name').lean();
  const doc = updated as unknown as { projectId?: { name: string } | null; jobId?: { _id: mongoose.Types.ObjectId; title: string } | null; recruiterId?: { _id: mongoose.Types.ObjectId; name: string } };
  const projectName = doc?.projectId && typeof doc.projectId === 'object' && 'name' in doc.projectId ? doc.projectId.name : null;
  const jobTitle = doc?.jobId && typeof doc.jobId === 'object' && 'title' in doc.jobId ? doc.jobId.title : null;
  const recruiterName = doc?.recruiterId && typeof doc.recruiterId === 'object' && 'name' in doc.recruiterId ? doc.recruiterId.name : null;

  if (body.jobId) {
    const jobOid = new mongoose.Types.ObjectId(body.jobId);
    const candidateOid = new mongoose.Types.ObjectId(id);
    const job = await Job.findById(jobOid).select('recruiterIds').lean();
    if (job && (req.user?.role === 'admin' || (job as { recruiterIds?: mongoose.Types.ObjectId[] }).recruiterIds?.some(id => id.toString() === userId))) {
      const existingApp = await Application.findOne({
        jobId: jobOid,
        crmCandidateId: candidateOid,
      }).select('_id').lean();
      if (!existingApp) {
        try {
          await Application.create({
            jobId: jobOid,
            crmCandidateId: candidateOid,
            status: 'applied',
          });
        } catch (err) {
          if ((err as { code?: number }).code !== 11000) throw err;
          // Duplicate – already in pipeline; treat as success
        }
      }
    }
  }

  res.json({
    success: true,
    data: toCandidateResponse(
      { ...updated, recruiterId: (doc?.recruiterId && typeof doc.recruiterId === 'object' ? doc.recruiterId._id : (updated as { recruiterId: mongoose.Types.ObjectId }).recruiterId) } as any,
      projectName,
      recruiterName,
      jobTitle
    ),
  });
});

/** Sync public LinkedIn data into candidate profile */
export const syncLinkedInPublic = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId) throw new AppError(401, 'Authentication required');

  const candidate = await Candidate.findById(id).lean();
  if (!candidate) throw new AppError(404, 'Candidate not found');
  if (role !== 'admin' && (candidate as { recruiterId: mongoose.Types.ObjectId }).recruiterId.toString() !== userId) {
    throw new AppError(403, 'You can only update your own candidates');
  }

  const linkedInUrl = normalizeLinkedInUrl((candidate as { linkedInUrl?: string }).linkedInUrl ?? '');
  if (!linkedInUrl) {
    throw new AppError(400, 'Please add a valid public LinkedIn profile URL first');
  }

  let scraped: Awaited<ReturnType<typeof scrapePublicLinkedInProfile>>;
  try {
    scraped = await scrapePublicLinkedInProfile(linkedInUrl);
  } catch (error: any) {
    const message = error instanceof AppError
      ? error.message
      : (error?.message || 'Unable to fetch LinkedIn public data');
    throw new AppError(400, message);
  }

  const hasUsefulData =
    !!scraped?.headline ||
    !!scraped?.location ||
    !!scraped?.about ||
    (Array.isArray(scraped?.skills) && scraped.skills.length > 0) ||
    (Array.isArray(scraped?.experiences) && scraped.experiences.length > 0);
  if (!hasUsefulData) {
    throw new AppError(
      400,
      'LinkedIn public data could not be extracted from this server (blocked by LinkedIn or scraper failed). Configure scraping provider keys (Apify token + actor id, or another provider) to fetch public profile details.'
    );
  }
  const updateFields: Record<string, unknown> = {};
  const existing = candidate as any;

  if ((!existing.name || String(existing.name).trim().length <= 1) && scraped.name) {
    updateFields.name = scraped.name;
  }
  if ((!existing.location || String(existing.location).trim().length === 0) && scraped.location) {
    updateFields.location = scraped.location;
  }
  if ((!existing.avatar || String(existing.avatar).trim().length === 0) && scraped.avatarUrl) {
    updateFields.avatar = scraped.avatarUrl;
  }
  if ((!Array.isArray(existing.experiences) || existing.experiences.length === 0) && scraped.experiences.length > 0) {
    updateFields.experiences = scraped.experiences;
  }
  if ((!Array.isArray(existing.skills) || existing.skills.length === 0) && scraped.skills.length > 0) {
    updateFields.skills = scraped.skills;
  }
  updateFields.linkedInUrl = linkedInUrl;

  const activityDescription = `LinkedIn public profile synced${scraped.headline ? `: ${scraped.headline}` : ''}`;
  updateFields.activities = [
    ...(Array.isArray(existing.activities) ? existing.activities : []),
    { type: 'linkedin_sync', description: activityDescription, date: new Date() },
  ];

  const updated = await Candidate.findByIdAndUpdate(id, updateFields, { new: true })
    .populate('projectId', 'name')
    .populate('jobId', 'title')
    .populate('recruiterId', 'name')
    .lean();

  const doc = updated as unknown as { projectId?: { name: string } | null; jobId?: { _id: mongoose.Types.ObjectId; title: string } | null; recruiterId?: { _id: mongoose.Types.ObjectId; name: string } };
  const projectName = doc?.projectId && typeof doc.projectId === 'object' && 'name' in doc.projectId ? doc.projectId.name : null;
  const jobTitle = doc?.jobId && typeof doc.jobId === 'object' && 'title' in doc.jobId ? doc.jobId.title : null;
  const recruiterName = doc?.recruiterId && typeof doc.recruiterId === 'object' && 'name' in doc.recruiterId ? doc.recruiterId.name : null;

  res.json({
    success: true,
    data: {
      candidate: toCandidateResponse(
        { ...updated, recruiterId: (doc?.recruiterId && typeof doc.recruiterId === 'object' ? doc.recruiterId._id : (updated as { recruiterId: mongoose.Types.ObjectId }).recruiterId) } as any,
        projectName,
        recruiterName,
        jobTitle
      ),
      scraped,
      syncedAt: new Date().toISOString(),
    },
  });
});

/** Delete candidate – admin only */
export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (req.user?.role !== 'admin') throw new AppError(403, 'Only admin can delete candidates');
  const id = req.params.id;
  const candidate = await Candidate.findByIdAndDelete(id);
  if (!candidate) throw new AppError(404, 'Candidate not found');
  res.json({ success: true, data: { message: 'Candidate deleted' } });
});

/** Get unique locations and tags for filter dropdowns */
export const getFilters = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const role = req.user?.role;
  const userId = req.user?.userId;
  const filter: any = role === 'admin' ? {} : { recruiterId: new mongoose.Types.ObjectId(userId) };

  const [candLocations, tags, jobLocations] = await Promise.all([
    Candidate.distinct('location', filter),
    Candidate.distinct('tags', filter),
    Job.distinct('location', role === 'admin' ? {} : { 'recruiterAssignments.recruiterId': new mongoose.Types.ObjectId(userId) })
  ]);

  const allLocations = Array.from(new Set([...candLocations, ...jobLocations]))
    .filter(Boolean)
    .sort();

  res.json({
    success: true,
    data: {
      locations: allLocations,
      tags: tags.filter(Boolean).sort()
    }
  });
});

/** Export candidates as CSV (Excel-compatible) – admin only */
export const exportCandidates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (req.user?.role !== 'admin') throw new AppError(403, 'Only admin can export candidates');
  const candidates = await Candidate.find({})
    .sort({ createdAt: -1 })
    .populate('projectId', 'name')
    .populate('recruiterId', 'name')
    .lean();
  const header = 'Name,Email,Phone,LinkedIn,GitHub,Project,Recruiter,Status,Blocked,Created At';
  const escape = (v: string | null | undefined): string => {
    if (v == null) return '';
    const s = String(v);
    if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = candidates.map((c) => {
    const doc = c as unknown as { name: string; email: string; phone?: string; linkedInUrl?: string; githubUrl?: string; projectId?: { name: string } | null; recruiterId?: { name: string } | null; status?: string; isBlocked?: boolean; createdAt: Date };
    const projectName = doc.projectId && typeof doc.projectId === 'object' && 'name' in doc.projectId ? doc.projectId.name : '';
    const recruiterName = doc.recruiterId && typeof doc.recruiterId === 'object' && 'name' in doc.recruiterId ? doc.recruiterId.name : '';
    return [
      escape(doc.name),
      escape(doc.email),
      escape(doc.phone),
      escape(doc.linkedInUrl),
      escape(doc.githubUrl),
      escape(projectName),
      escape(recruiterName),
      escape(doc.status),
      doc.isBlocked ? 'Yes' : 'No',
      doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
    ].join(',');
  });
  const csv = [header, ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="candidates-export.csv"');
  res.send('\uFEFF' + csv);
});
