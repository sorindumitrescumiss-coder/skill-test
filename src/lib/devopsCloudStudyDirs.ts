import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` for DevOps / cloud PDFs (first wins on duplicate filenames). */
export const DEVOPS_CLOUD_STUDY_FOLDER_NAMES = [
  'devops-cloud',
  'devops cloud',
  'DevOps  cloud',
  'DevOps cloud',
  'devops',
] as const;

export function resolveDevopsCloudStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return DEVOPS_CLOUD_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
