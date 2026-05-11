import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` for photography PDFs (first wins on duplicate filenames). */
export const PHOTOGRAPHY_STUDY_FOLDER_NAMES = [
  'photography',
  'Photography',
  'photo',
] as const;

export function resolvePhotographyStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return PHOTOGRAPHY_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
