import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` for cybersecurity PDFs (first wins on duplicate filenames). */
export const CYBERSECURITY_STUDY_FOLDER_NAMES = [
  'cybersecurity',
  'Cybersecurity',
  'cyber-security',
  'cyber security',
] as const;

export function resolveCybersecurityStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return CYBERSECURITY_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
