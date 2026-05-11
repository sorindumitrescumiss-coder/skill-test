import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` for desktop-app PDFs (first wins on duplicate filenames). */
export const DESKTOP_APPLICATIONS_STUDY_FOLDER_NAMES = [
  'desktop-applications',
  'desktop application',
  'desktop',
] as const;

export function resolveDesktopApplicationsStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return DESKTOP_APPLICATIONS_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
