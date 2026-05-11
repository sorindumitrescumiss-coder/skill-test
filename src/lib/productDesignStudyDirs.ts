import fs from 'fs';
import path from 'path';

/** Folder names under `studying/` for product design PDFs (first wins on duplicate filenames). */
export const PRODUCT_DESIGN_STUDY_FOLDER_NAMES = [
  'product-design',
  'Product design',
  'product design',
] as const;

export function resolveProductDesignStudyBookDirs(cwd: string = process.cwd()): string[] {
  const studying = path.join(cwd, 'studying');
  return PRODUCT_DESIGN_STUDY_FOLDER_NAMES.map((name) => path.join(studying, name)).filter(
    (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory(),
  );
}
