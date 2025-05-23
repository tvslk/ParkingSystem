import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }
  
  try {
    console.log("Proxying image from:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Image fetch failed with status ${response.status}`);
    }
    
    const contentType = response.headers.get('Content-Type');
    const imageBlob = await response.blob();
    
    // Return the image with appropriate headers
    return new NextResponse(imageBlob, {
      headers: {
        'Content-Type': contentType || 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      }
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    // Return a default avatar as fallback
    return NextResponse.redirect(new URL('/avatar.png', request.url));
  }
}