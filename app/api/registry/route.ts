import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the path to components.json
    const componentsPath = path.join(process.cwd(), 'components.json');
    
    // Read the file
    const rawData = await fs.readFile(componentsPath, 'utf-8');
    const registry = JSON.parse(rawData);

    // Return the first registry item
    return NextResponse.json(registry.registry[0], {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Registry error:', error);
    return NextResponse.json({ error: 'Failed to load registry' }, { status: 500 });
  }
}
