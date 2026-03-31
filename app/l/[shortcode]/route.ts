import { NextResponse } from 'next/server';
import { getLinkByShortCode } from '@/data/links';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortcode: string }> },
) {
  try {
    const { shortcode } = await params;
    const link = await getLinkByShortCode(shortcode);

    if (!link) {
      return new NextResponse('Not found', { status: 404 });
    }

    return NextResponse.redirect(link.url, { status: 301 });
  } catch {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
