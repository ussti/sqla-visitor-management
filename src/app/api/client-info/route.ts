import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get client information for consent records
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Extract IP address (handle proxy scenarios)
    let ip = 'unknown';
    if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp.trim();
    } else {
      // Fallback - no direct IP access in NextRequest
      ip = 'unknown';
    }

    return NextResponse.json({
      ip: ip,
      userAgent: userAgent || 'unknown',
      timestamp: new Date().toISOString(),
      headers: {
        forwarded,
        realIp,
        userAgent
      }
    });
  } catch (error) {
    console.error('Error getting client info:', error);

    return NextResponse.json({
      ip: 'unknown',
      userAgent: 'unknown',
      timestamp: new Date().toISOString(),
      error: 'Failed to retrieve client information'
    });
  }
}