export type ParsedJobFields = {
  title: string;
  companyName: string;
  location: string;
  salary: string;
  description: string;
  workplaceType: string;
  roleType: string;
  experience: string;
  visa: string;
  reportsTo: string;
  interviewProcess: string;
  whatYoullDo: string;
  mustHaveText: string;
  niceToHaveText: string;
  notAFitText: string;
  skills: string[];
};

const SECTION_STOP =
  /^(must have|nice to have|not a fit|what you(?:'|')?ll do|about|responsibilities|requirements|qualifications|skills|focus|compensation|salary|location|experience|visa|reports? to|interview)/i;

function linesOf(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function valueAfterLabel(lines: string[], pattern: RegExp): string {
  const idx = lines.findIndex((l) => pattern.test(l));
  if (idx < 0) return '';
  const line = lines[idx];
  const inline = line.replace(pattern, '').replace(/^[:–—-]\s*/, '').trim();
  if (inline) return inline;
  return lines[idx + 1]?.replace(/^[:–—-]\s*/, '').trim() ?? '';
}

function sectionBullets(lines: string[], header: RegExp): string {
  const start = lines.findIndex((l) => header.test(l.replace(/[:•\-–—]+$/g, '').trim()));
  if (start < 0) return '';
  const items: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (SECTION_STOP.test(l.replace(/[:•\-–—]+$/g, '').trim())) break;
    const cleaned = l.replace(/^[-•*✓✕▪]\s*/, '').trim();
    if (cleaned) items.push(cleaned);
  }
  return items.join('\n');
}

function sectionBlock(lines: string[], header: RegExp): string {
  const start = lines.findIndex((l) => header.test(l.replace(/[:•\-–—]+$/g, '').trim()));
  if (start < 0) return '';
  const blocks: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (SECTION_STOP.test(l.replace(/[:•\-–—]+$/g, '').trim())) break;
    blocks.push(l);
  }
  return blocks.join('\n').trim();
}

function detectWorkplace(text: string): string {
  const t = text.toLowerCase();
  if (/\bhybrid\b/.test(t)) return 'Hybrid';
  if (/\bremote\b/.test(t)) return 'Remote';
  if (/\bin-?office\b|\bon-?site\b/.test(t)) return 'In-Office';
  return '';
}

function detectSalary(text: string): string {
  const range = text.match(
    /\$[\d,]+k?\s*(?:–|-|to)\s*\$[\d,]+k?(?:\s*\+\s*equity)?/i
  );
  if (range) return range[0];
  const single = text.match(/\$[\d,]+k?(?:\s*–\s*\$[\d,]+k?)?(?:\s*\+\s*Equity)?/i);
  return single?.[0]?.trim() ?? '';
}

function detectLocation(text: string, lines: string[]): string {
  const labeled = valueAfterLabel(lines, /^location\b/i);
  if (labeled) return labeled;
  const m = text.match(
    /(?:San Francisco|San Mateo|New York|NYC|London|Remote|Bay Area)[^,\n]*(?:,\s*[A-Z]{2})?/i
  );
  return m?.[0]?.trim() ?? '';
}

function detectTitle(lines: string[], fileName?: string): string {
  const skip = /^(must|nice|about|location|visa|compensation|salary|job|role description)/i;
  const candidate = lines.find(
    (l) => l.length >= 4 && l.length <= 70 && !skip.test(l) && !/^\$/.test(l)
  );
  if (candidate) return candidate.replace(/^(role|position|title)[:]\s*/i, '').trim();
  if (fileName) {
    return fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
  }
  return '';
}

function detectRoleType(text: string): string {
  const m = text.match(/full-?time[^.\n]{0,40}/i);
  return m?.[0]?.trim() ?? '';
}

export function parseJobDescriptionText(text: string, fileName?: string): ParsedJobFields {
  const lines = linesOf(text);
  const normalized = text.replace(/\r\n/g, '\n');

  const mustHaveText = sectionBullets(lines, /^must have/i) || sectionBullets(lines, /^requirements/i);
  const niceToHaveText = sectionBullets(lines, /^nice to have/i) || sectionBullets(lines, /^preferred/i);
  const notAFitText = sectionBullets(lines, /^not a fit/i);
  const whatYoullDo =
    sectionBlock(lines, /^what you(?:'|')?ll do/i) ||
    sectionBlock(lines, /^responsibilities/i);

  let description =
    sectionBlock(lines, /^about(?: the role| the company)?/i) ||
    sectionBlock(lines, /^overview/i) ||
    sectionBlock(lines, /^the role/i);

  if (!description) {
    const stopAt = lines.findIndex((l) => SECTION_STOP.test(l));
    const introEnd = stopAt > 0 ? stopAt : Math.min(6, lines.length);
    description = lines.slice(1, introEnd).join('\n\n');
  }

  const skillsLine = valueAfterLabel(lines, /^skills/i) || valueAfterLabel(lines, /^focus areas/i);
  const skills = skillsLine
    ? skillsLine.split(/[,/|•·]/).map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    title: detectTitle(lines, fileName),
    companyName: valueAfterLabel(lines, /^company\b/i) || valueAfterLabel(lines, /^organization\b/i),
    location: detectLocation(normalized, lines),
    salary: detectSalary(normalized) || valueAfterLabel(lines, /^compensation/i) || valueAfterLabel(lines, /^salary/i),
    description,
    workplaceType: detectWorkplace(normalized),
    roleType: valueAfterLabel(lines, /^role type/i) || detectRoleType(normalized),
    experience: valueAfterLabel(lines, /^experience/i),
    visa: valueAfterLabel(lines, /^visa/i),
    reportsTo: valueAfterLabel(lines, /^reports?\s*to/i),
    interviewProcess: valueAfterLabel(lines, /^interview(?:\s*process)?/i),
    whatYoullDo,
    mustHaveText,
    niceToHaveText,
    notAFitText,
    skills,
  };
}
