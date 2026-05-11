import fs from 'fs';
import path from 'path';
import { NextResponse, type NextRequest } from 'next/server';
import { getMimeType, resolveUnderRoot } from '@/lib/studyStaticServe';

const ARCHITECTURE_BOOKS_ROOT = path.join(process.cwd(), 'studying', 'architecture');

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  const { path: raw } = await context.params;
  const segments = (raw ?? []).filter(Boolean);
  if (!segments.length) return new NextResponse('Not Found', { status: 404 });

  const filePath = resolveUnderRoot(ARCHITECTURE_BOOKS_ROOT, segments);
  if (!filePath) return new NextResponse('Not Found', { status: 404 });

  const st = fs.statSync(filePath);
  if (!st.isFile()) return new NextResponse('Not Found', { status: 404 });

  return new NextResponse(fs.readFileSync(filePath), {
    headers: {
      'Content-Type': getMimeType(filePath),
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
