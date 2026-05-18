import { NextResponse } from 'next/server';
import { getStripePublicConfig } from '@/lib/stripe/config';

export async function GET() {
  return NextResponse.json(getStripePublicConfig());
}
