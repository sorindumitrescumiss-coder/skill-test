import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` for data engineering PDFs (first wins on duplicate filenames). */
export const DATA_ENGINEERING_STUDY_FOLDER_NAMES = [
  'data-engineering',
  'Data engineering',
  'data engineering',
  'data enginnering',
] as const;

export function resolveDataEngineeringStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return DATA_ENGINEERING_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
