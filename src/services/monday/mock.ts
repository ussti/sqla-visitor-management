import { Visitor } from '@/types/visitor';
import { StaffMember } from '@/types/staff';

export class MockMondayService {
  private visitors: Visitor[] = [];
  private staff: StaffMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@sqla.com',
      jobTitle: 'Creative Director',
      googleChat: '@sarah.johnson',
      isActive: true
    },
    {
      id: '2',
      name: 'Mike Davis',
      email: 'mike@sqla.com',
      jobTitle: 'Producer',
      googleChat: '@mike.davis',
      isActive: true
    },
    {
      id: '3',
      name: 'Lisa Chen',
      email: 'lisa@sqla.com',
      jobTitle: 'Operations Manager',
      googleChat: '@lisa.chen',
      isActive: true
    },
    {
      id: '4',
      name: 'John Smith',
      email: 'john@sqla.com',
      jobTitle: 'Technical Director',
      googleChat: '@john.smith',
      isActive: true
    }
  ];

  async testConnection(): Promise<{ success: boolean; user?: { id: string; name: string; email: string }; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      user: { id: 'mock-user-id', name: 'Mock User', email: 'mock@sqla.com' }
    };
  }

  async getStaffDirectory(): Promise<StaffMember[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.staff.filter(member => member.isActive);
  }

  async findStaffMember(id: string): Promise<StaffMember | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.staff.find(member => member.id === id) || null;
  }

  async createVisitor(visitorData: Omit<Visitor, 'id' | 'createdAt'>): Promise<{ id: string; name: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate potential API errors randomly (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Mock API Error: Failed to create visitor record');
    }

    const visitor: Visitor = {
      ...visitorData,
      id: `visitor_${Date.now()}`,
      createdAt: new Date()
    };

    this.visitors.push(visitor);
    console.log('🟡 Mock: Created visitor:', visitor);

    return {
      id: visitor.id!,
      name: `${visitor.name} ${visitor.surname}`
    };
  }

  async findVisitorByEmail(email: string): Promise<{ id: string; name: string; email: string; firstName?: string; lastName?: string; companyName?: string; position?: string } | null> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const visitor = this.visitors.find(v => v.email.toLowerCase() === email.toLowerCase());

    if (visitor) {
      return {
        id: visitor.id!,
        name: `${visitor.name} ${visitor.surname}`,
        email: visitor.email,
        firstName: visitor.name,
        lastName: visitor.surname,
        companyName: visitor.organization,
        position: undefined
      };
    }

    return null;
  }

  async updateVisitorStatus(itemId: string, status: 'Registered' | 'Checked In'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const visitor = this.visitors.find(v => v.id === itemId);
    if (visitor) {
      visitor.status = status;
      console.log('🟡 Mock: Updated visitor status:', { id: itemId, status });
    }
  }

  async uploadVisitorPhoto(itemId: string, photoFile: File): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const visitor = this.visitors.find(v => v.id === itemId);
    if (visitor) {
      visitor.photoUrl = `https://mock-cdn.sqla.com/photos/${itemId}/${photoFile.name}`;
      console.log('🟡 Mock: Uploaded visitor photo:', { itemId, filename: photoFile.name });
    }
  }

  async uploadVisitorNDA(itemId: string, ndaFile: File): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const visitor = this.visitors.find(v => v.id === itemId);
    if (visitor) {
      visitor.ndaPdfUrl = `https://mock-cdn.sqla.com/nda/${itemId}/${ndaFile.name}`;
      visitor.ndaSignedAt = new Date();
      console.log('🟡 Mock: Uploaded visitor NDA:', { itemId, filename: ndaFile.name });
    }
  }

  // Debug method to see all mock data
  getAllMockData() {
    return {
      visitors: this.visitors,
      staff: this.staff
    };
  }

  // Add a sample visitor for testing returning visitor functionality
  addSampleVisitor() {
    const sampleVisitor: Visitor = {
      id: 'sample_visitor_1',
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      organization: 'Tech Corp',
      hostId: '1',
      hostName: 'Sarah Johnson',
      visitDate: new Date('2024-01-15'),
      status: 'Registered',
      createdAt: new Date('2024-01-15')
    };

    this.visitors.push(sampleVisitor);
    console.log('🟡 Mock: Added sample visitor for testing');
  }

  // Reset mock data for testing
  resetMockData() {
    this.visitors = [];
    console.log('🟡 Mock: Reset all visitor data');
  }
}

export const mockMondayService = new MockMondayService();