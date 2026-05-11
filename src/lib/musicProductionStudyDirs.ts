import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` for music-production PDFs (first wins on duplicate filenames). */
export const MUSIC_PRODUCTION_STUDY_FOLDER_NAMES = [
  'music-production',
  'Music production',
  'music production',
] as const;

export function resolveMusicProductionStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return MUSIC_PRODUCTION_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
