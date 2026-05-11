import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` for business finance PDFs (first wins on duplicate filenames). */
export const BUSINESS_FINANCE_STUDY_FOLDER_NAMES = [
  'business-finance',
  'Business & finance',
  'business finance',
] as const;

export function resolveBusinessFinanceStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return BUSINESS_FINANCE_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
