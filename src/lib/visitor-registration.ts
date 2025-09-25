import { mondayService } from '@/services/monday';
import { CompleteRegistration } from './validation';
import { generateFileName } from './file-utils';

export interface RegistrationResult {
  success: boolean;
  visitorId?: string;
  error?: string;
}

export class VisitorRegistrationService {
  async completeRegistration(data: CompleteRegistration): Promise<RegistrationResult> {
    try {
      console.log('🟢 Starting visitor registration process...');

      // Step 1: Create visitor record in Monday.com
      const visitorRecord = await mondayService.createVisitor({
        name: data.firstName!,
        surname: data.lastName!,
        email: data.email!,
        organization: data.companyName,
        hostId: data.hostId!,
        hostName: data.hostName!,
        visitDate: new Date(),
        status: 'Registered'
      });

      console.log('✅ Visitor record created:', visitorRecord);

      // Step 2: Upload photo if provided
      if (data.photoBlob) {
        const photoFile = new File(
          [data.photoBlob],
          generateFileName('photo', 'jpg'),
          { type: 'image/jpeg' }
        );

        await mondayService.uploadVisitorPhoto(visitorRecord.id, photoFile);
        console.log('✅ Visitor photo uploaded');
      }

      // Step 3: Generate and upload NDA if signed
      if (data.signatureBlob && data.ndaAccepted) {
        // In a real implementation, you would generate the NDA PDF here
        // For now, we'll create a placeholder file with the signature
        const ndaFile = new File(
          [data.signatureBlob],
          generateFileName('NDA', 'pdf'),
          { type: 'application/pdf' }
        );

        await mondayService.uploadVisitorNDA(visitorRecord.id, ndaFile);
        console.log('✅ NDA uploaded');
      }

      // Step 4: Update status to indicate registration completion
      await mondayService.updateVisitorStatus(visitorRecord.id, 'Registered');
      console.log('✅ Visitor status updated to Registered');

      return {
        success: true,
        visitorId: visitorRecord.id
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateVisitorStatus(visitorId: string, status: 'Registered' | 'Checked In'): Promise<void> {
    try {
      await mondayService.updateVisitorStatus(visitorId, status);
      console.log(`✅ Visitor ${visitorId} status updated to ${status}`);
    } catch (error) {
      console.error('❌ Failed to update visitor status:', error);
      throw error;
    }
  }

  async getVisitorById(visitorId: string): Promise<any> {
    // This would implement getting a specific visitor record
    // For now, this is a placeholder
    console.log(`Getting visitor ${visitorId}`);
    return null;
  }

  async checkInVisitor(visitorId: string): Promise<RegistrationResult> {
    try {
      await this.updateVisitorStatus(visitorId, 'Checked In');
      return { success: true, visitorId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check in visitor'
      };
    }
  }
}

// Export singleton instance
export const visitorRegistrationService = new VisitorRegistrationService();