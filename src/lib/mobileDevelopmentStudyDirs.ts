import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` that hold mobile-dev PDFs (first match wins for duplicate filenames). */
export const MOBILE_DEVELOPMENT_STUDY_FOLDER_NAMES = [
  'mobile-development',
  'mobile development',
  'mobile',
] as const;

export function resolveMobileDevelopmentStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return MOBILE_DEVELOPMENT_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
