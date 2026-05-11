import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` for Embedded / IoT PDFs (first wins on duplicate filenames). */
export const EMBEDDED_IOT_STUDY_FOLDER_NAMES = [
  'embedded-iot',
  'embedded iot',
  'Embedded  IoT',
  'Embedded IoT',
  'embedded',
  'iot',
  'IoT',
] as const;

export function resolveEmbeddedIotStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return EMBEDDED_IOT_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
