import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export async function extractPdfText(
  buffer: Buffer,
  originalname = '',
  mimetype = ''
): Promise<string> {
  const isPDF =
    mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf');
  const bufferHeader = buffer.slice(0, 5).toString();

  if (!isPDF && bufferHeader !== '%PDF-') {
    return buffer.toString('utf-8').slice(0, 80000);
  }

  let text = '';
  const pdfModule = require('pdf-parse');

  if (pdfModule.PDFParse) {
    try {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const result = await parser.getText();
      text = (result?.text || '').trim();
      await parser.destroy();
    } catch {
      /* try fallback */
    }
  }

  if (!text && typeof pdfModule === 'function') {
    try {
      const result = await pdfModule(buffer);
      text = (result?.text || '').trim();
    } catch {
      /* try fallback */
    }
  }

  if (!text && pdfModule.default && typeof pdfModule.default === 'function') {
    try {
      const result = await pdfModule.default(buffer);
      text = (result?.text || '').trim();
    } catch {
      /* ignore */
    }
  }

  return text;
}
