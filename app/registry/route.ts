import { NextResponse } from 'next/server';
import registry from '@/components.json';

export async function GET() {
  // Return the registry configuration
  return NextResponse.json(registry.registry[0], {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=86400', // Cache for 24 hours
    },
  });
}
