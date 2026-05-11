import fs from 'fs';
import { NextResponse, type NextRequest } from 'next/server';
import path from 'path';
import { getMimeType, resolveUnderRoot } from '@/lib/studyStaticServe';

const BOOKS_ROOT = path.join(process.cwd(), 'studying', 'web', 'books', 'web books');

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  const { path: raw } = await context.params;
  const segments = (raw ?? []).filter(Boolean);
  if (!segments.length) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const filePath = resolveUnderRoot(BOOKS_ROOT, segments);
  if (!filePath) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const st = fs.statSync(filePath);
  if (!st.isFile()) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const body = fs.readFileSync(filePath);
  return new NextResponse(body, {
    headers: {
      'Content-Type': getMimeType(filePath),
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
