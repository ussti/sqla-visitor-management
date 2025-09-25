import { NextResponse } from 'next/server';
import { mondayService } from '@/services/monday';

export async function GET() {
  try {
    // Test connection
    const connection = await mondayService.testConnection();

    // Get all mock data for testing
    const mockData = mondayService.getRawClient().getAllMockData?.();

    // Test staff directory
    const staff = await mondayService.getStaffDirectory();

    return NextResponse.json({
      success: true,
      connection,
      mockData,
      staff,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'addSampleVisitor') {
      // Add sample visitor for testing
      mondayService.getRawClient().addSampleVisitor?.();
      return NextResponse.json({
        success: true,
        message: 'Sample visitor added',
        timestamp: new Date().toISOString()
      });
    }

    if (body.action === 'resetData') {
      // Reset mock data
      mondayService.getRawClient().resetMockData?.();
      return NextResponse.json({
        success: true,
        message: 'Mock data reset',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}