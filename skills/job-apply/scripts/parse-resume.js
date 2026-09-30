import fs from 'node:fs';
import path from 'node:path';

export async function extractResumeText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buf = fs.readFileSync(filePath);
  if (ext === '.pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buf);
    return data.text;
  }
  if (ext === '.docx') {
    const mammoth = await import('mammoth');
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return value;
  }
  if (ext === '.txt' || ext === '.md') {
    return buf.toString('utf-8');
  }
  throw new Error(`Unsupported resume format: ${ext}`);
}
