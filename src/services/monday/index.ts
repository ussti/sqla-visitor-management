import { mondayClient } from './client';
import { mockMondayService } from './mock';
import { Visitor } from '@/types/visitor';
import { StaffMember } from '@/types/staff';

// Service interface
export interface MondayService {
  testConnection(): Promise<{ success: boolean; user?: { id: string; name: string; email: string }; error?: string }>;
  getStaffDirectory(): Promise<StaffMember[]>;
  findStaffMember(id: string): Promise<StaffMember | null>;
  createVisitor(visitorData: Omit<Visitor, 'id' | 'createdAt'>): Promise<{ id: string; name: string }>;
  findVisitorByEmail(email: string): Promise<{ id: string; name: string; email: string; firstName?: string; lastName?: string; companyName?: string; position?: string } | null>;
  updateVisitorStatus(itemId: string, status: 'Registered' | 'Checked In'): Promise<void>;
  uploadVisitorPhoto(itemId: string, photoFile: File): Promise<void>;
  uploadVisitorNDA(itemId: string, ndaFile: File): Promise<void>;
  // Enhanced status tracking methods
  updateItemStatus(itemId: string, status: string): Promise<void>;
  updateItem(itemId: string, columnValues: Record<string, any>): Promise<void>;
  trackNotificationStatus(itemId: string, notificationType: 'email' | 'chat', status: 'sent' | 'failed', messageId?: string): Promise<void>;
  getItemStatus(itemId: string): Promise<{ status: string; notifications: any[]; lastUpdated: string }>;
}

class MondayServiceAdapter implements MondayService {
  private useMock: boolean;

  constructor() {
    // Use mock service in development if no API key is provided
    this.useMock = process.env.NODE_ENV === 'development' && !process.env.MONDAY_API_KEY;

    if (this.useMock) {
      console.log('🟡 Using Mock Monday.com service for development');
      // Add sample visitor for testing returning visitor functionality
      setTimeout(() => mockMondayService.addSampleVisitor(), 100);
    } else {
      console.log('🟢 Using real Monday.com API');
    }
  }

  async testConnection() {
    if (this.useMock) {
      return await mockMondayService.testConnection();
    } else {
      return await mondayClient.testConnection();
    }
  }

  async getStaffDirectory(): Promise<StaffMember[]> {
    if (this.useMock) {
      return await mockMondayService.getStaffDirectory();
    } else {
      return await mondayClient.getStaffDirectory();
    }
  }

  async findStaffMember(id: string): Promise<StaffMember | null> {
    if (this.useMock) {
      return await mockMondayService.findStaffMember(id);
    } else {
      return await mondayClient.findStaffMember(id);
    }
  }

  async createVisitor(visitorData: Omit<Visitor, 'id' | 'createdAt'>): Promise<{ id: string; name: string }> {
    if (this.useMock) {
      return await mockMondayService.createVisitor(visitorData);
    } else {
      return await mondayClient.createVisitor(visitorData);
    }
  }

  async findVisitorByEmail(email: string): Promise<{ id: string; name: string; email: string } | null> {
    if (this.useMock) {
      return await mockMondayService.findVisitorByEmail(email);
    } else {
      return await mondayClient.findVisitorByEmail(email);
    }
  }

  async updateVisitorStatus(itemId: string, status: 'Registered' | 'Checked In'): Promise<void> {
    if (this.useMock) {
      await mockMondayService.updateVisitorStatus(itemId, status);
    } else {
      await mondayClient.updateVisitorStatus(itemId, status);
    }
  }

  async uploadVisitorPhoto(itemId: string, photoFile: File): Promise<void> {
    if (this.useMock) {
      await mockMondayService.uploadVisitorPhoto(itemId, photoFile);
    } else {
      await mondayClient.uploadVisitorPhoto(itemId, photoFile);
    }
  }

  async uploadVisitorNDA(itemId: string, ndaFile: File): Promise<void> {
    if (this.useMock) {
      await mockMondayService.uploadVisitorNDA(itemId, ndaFile);
    } else {
      await mondayClient.uploadVisitorNDA(itemId, ndaFile);
    }
  }

  // Enhanced status tracking methods
  async updateItemStatus(itemId: string, status: string): Promise<void> {
    if (this.useMock) {
      await mockMondayService.updateItemStatus(itemId, status);
    } else {
      await mondayClient.updateItemStatus(itemId, status);
    }
  }

  async updateItem(itemId: string, columnValues: Record<string, any>): Promise<void> {
    if (this.useMock) {
      await mockMondayService.updateItem(itemId, columnValues);
    } else {
      await mondayClient.updateItem(itemId, columnValues);
    }
  }

  async trackNotificationStatus(itemId: string, notificationType: 'email' | 'chat', status: 'sent' | 'failed', messageId?: string): Promise<void> {
    if (this.useMock) {
      await mockMondayService.trackNotificationStatus(itemId, notificationType, status, messageId);
    } else {
      await mondayClient.trackNotificationStatus(itemId, notificationType, status, messageId);
    }
  }

  async getItemStatus(itemId: string): Promise<{ status: string; notifications: any[]; lastUpdated: string }> {
    if (this.useMock) {
      return await mockMondayService.getItemStatus(itemId);
    } else {
      return await mondayClient.getItemStatus(itemId);
    }
  }

  // Helper methods
  isUsingMock(): boolean {
    return this.useMock;
  }

  getRawClient() {
    return this.useMock ? mockMondayService : mondayClient;
  }
}

// Export singleton instance
export const mondayService = new MondayServiceAdapter();

// Export types and classes for direct use if needed
export { MondayClient } from './client';
export { MockMondayService } from './mock';
export { mondayClient, mockMondayService };