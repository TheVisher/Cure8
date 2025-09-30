import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/server/db';

const DEFAULT_USER_ID = 'default';

// GET settings
export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: DEFAULT_USER_ID,
          autoFetchMetadata: true,
          showThumbnails: true,
          previewServiceUrl: 'http://localhost:8787/preview?url={{url}}',
          layoutMode: 'grid',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PATCH update settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { autoFetchMetadata, showThumbnails, previewServiceUrl, layoutMode } = body;

    // Ensure settings exist first
    let settings = await prisma.settings.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: DEFAULT_USER_ID,
          autoFetchMetadata: autoFetchMetadata ?? true,
          showThumbnails: showThumbnails ?? true,
          previewServiceUrl: previewServiceUrl ?? 'http://localhost:8787/preview?url={{url}}',
          layoutMode: layoutMode ?? 'grid',
        },
      });
    } else {
      settings = await prisma.settings.update({
        where: { userId: DEFAULT_USER_ID },
        data: {
          ...(autoFetchMetadata !== undefined && { autoFetchMetadata }),
          ...(showThumbnails !== undefined && { showThumbnails }),
          ...(previewServiceUrl !== undefined && { previewServiceUrl }),
          ...(layoutMode !== undefined && { layoutMode }),
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}