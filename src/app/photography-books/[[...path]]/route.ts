import fs from 'fs';
import { NextResponse, type NextRequest } from 'next/server';
import { getMimeType, resolveUnderRoot } from '@/lib/studyStaticServe';
import { resolvePhotographyStudyBookDirs } from '@/lib/photographyStudyDirs';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  const { path: raw } = await context.params;
  const segments = (raw ?? []).filter(Boolean);
  if (!segments.length) return new NextResponse('Not Found', { status: 404 });

  for (const root of resolvePhotographyStudyBookDirs()) {
    const filePath = resolveUnderRoot(root, segments);
    if (!filePath) continue;
    const st = fs.statSync(filePath);
    if (!st.isFile()) continue;
    return new NextResponse(fs.readFileSync(filePath), {
      headers: {
        'Content-Type': getMimeType(filePath),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return new NextResponse('Not Found', { status: 404 });
}
