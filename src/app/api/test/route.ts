import { NextResponse } from 'next/server';
import { mondayService } from '@/services/monday';

export async function GET() {
  try {
    // Test connection
    const connection = await mondayService.testConnection();

    // Get all mock data for testing (check if mock service)
    const rawClient = mondayService.getRawClient();
    const mockData = 'getAllMockData' in rawClient ? (rawClient as any).getAllMockData?.() : null;

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
      // Add sample visitor for testing (mock only)
      const rawClient = mondayService.getRawClient();
      if ('addSampleVisitor' in rawClient && typeof rawClient.addSampleVisitor === 'function') {
        (rawClient as any).addSampleVisitor();
      }
      return NextResponse.json({
        success: true,
        message: 'Sample visitor added (mock only)',
        timestamp: new Date().toISOString()
      });
    }

    if (body.action === 'resetData') {
      // Reset mock data (mock only)
      const rawClient = mondayService.getRawClient();
      if ('resetMockData' in rawClient && typeof rawClient.resetMockData === 'function') {
        (rawClient as any).resetMockData();
      }
      return NextResponse.json({
        success: true,
        message: 'Mock data reset (mock only)',
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