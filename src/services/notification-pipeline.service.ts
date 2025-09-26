import { EmailService } from './email.service';
import { GoogleChatService } from './google-chat.service';
import { FileUploadService } from './file-upload.service';
import { mondayService } from './monday';
import type { CompleteRegistration } from '@/lib/validation';

export interface NotificationStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  result?: any;
  error?: string;
  attempts: number;
  maxAttempts: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export interface NotificationPipelineResult {
  success: boolean;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  steps: NotificationStep[];
  mondayRecordId?: number;
  mondayRecordUrl?: string;
}

export interface PipelineConfig {
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
  continueOnFailure: boolean;
}

export class NotificationPipelineService {
  private emailService: EmailService;
  private chatService: GoogleChatService;
  private mondayService = mondayService;
  private fileUploadService: FileUploadService;
  private config: PipelineConfig;

  constructor(config: Partial<PipelineConfig> = {}) {
    this.emailService = new EmailService();
    this.chatService = new GoogleChatService();
    this.fileUploadService = new FileUploadService();

    this.config = {
      maxRetries: 2,
      retryDelayMs: 1000,
      timeoutMs: 30000,
      continueOnFailure: true,
      ...config
    };
  }

  async processVisitorRegistration(
    visitorData: CompleteRegistration,
    onStepUpdate?: (step: NotificationStep) => void
  ): Promise<NotificationPipelineResult> {
    const result: NotificationPipelineResult = {
      success: false,
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      steps: []
    };

    // Initialize pipeline steps
    const steps: NotificationStep[] = [
      {
        id: 'file-upload',
        name: 'Upload files to Monday.com',
        status: 'pending',
        attempts: 0,
        maxAttempts: this.config.maxRetries + 1
      },
      {
        id: 'monday-status',
        name: 'Update visitor status in Monday.com',
        status: 'pending',
        attempts: 0,
        maxAttempts: this.config.maxRetries + 1
      },
      {
        id: 'host-email',
        name: 'Send host notification email',
        status: 'pending',
        attempts: 0,
        maxAttempts: this.config.maxRetries + 1
      },
      {
        id: 'welcome-email',
        name: 'Send welcome package email',
        status: 'pending',
        attempts: 0,
        maxAttempts: this.config.maxRetries + 1
      },
      {
        id: 'chat-notification',
        name: 'Send Google Chat notification',
        status: 'pending',
        attempts: 0,
        maxAttempts: this.config.maxRetries + 1
      },
      {
        id: 'final-status',
        name: 'Update final processing status',
        status: 'pending',
        attempts: 0,
        maxAttempts: this.config.maxRetries + 1
      }
    ];

    result.steps = steps;
    result.totalSteps = steps.length;

    try {
      // Step 1: Upload files to Monday.com
      await this.executeStep(steps[0], async () => {
        const uploadResult = await this.fileUploadService.uploadVisitorFiles(visitorData);
        result.mondayRecordId = uploadResult.itemId;

        if (uploadResult.itemId) {
          result.mondayRecordUrl = `https://sqla-studio.monday.com/boards/${process.env.MONDAY_VISITORS_BOARD_ID}/pulses/${uploadResult.itemId}`;
        }

        if (!uploadResult.success && uploadResult.errors.length > 0) {
          throw new Error(`File upload failed: ${uploadResult.errors.join(', ')}`);
        }

        return uploadResult;
      }, onStepUpdate);

      // Step 2: Update Monday.com status
      await this.executeStep(steps[1], async () => {
        if (result.mondayRecordId) {
          return await this.mondayService.updateItem(result.mondayRecordId.toString(), {
            status: 'Registration Complete',
            processing_status: 'Processing Notifications',
            last_updated: new Date().toISOString()
          });
        }
        return { success: true, message: 'No Monday record to update' };
      }, onStepUpdate);

      // Step 3: Send host notification email
      await this.executeStep(steps[2], async () => {
        const emailResult = await this.emailService.sendHostNotification({
          hostName: visitorData.hostName!,
          hostEmail: visitorData.hostEmail!,
          visitorName: `${visitorData.firstName} ${visitorData.lastName}`,
          visitorEmail: visitorData.email!,
          visitorCompany: visitorData.companyName,
          visitTime: new Date().toLocaleString(),
          mondayRecordUrl: result.mondayRecordUrl
        });

        // Track notification status in Monday.com
        if (result.mondayRecordId) {
          await this.mondayService.trackNotificationStatus(
            result.mondayRecordId.toString(),
            'email',
            emailResult.success ? 'sent' : 'failed',
            emailResult.messageId
          );
        }

        return emailResult;
      }, onStepUpdate);

      // Step 4: Send welcome package email
      await this.executeStep(steps[3], async () => {
        const welcomeResult = await this.emailService.sendWelcomePackage(visitorData, {
          includePDF: !!visitorData.pdfBlob,
          includeStudioMap: true,
          includeWiFiInfo: true
        });

        // Track welcome email status
        if (result.mondayRecordId) {
          await this.mondayService.trackNotificationStatus(
            result.mondayRecordId.toString(),
            'email',
            welcomeResult.success ? 'sent' : 'failed',
            welcomeResult.messageId
          );
        }

        return welcomeResult;
      }, onStepUpdate);

      // Step 5: Send Google Chat notification
      await this.executeStep(steps[4], async () => {
        const chatResult = await this.chatService.notifyTeamOfVisitor(visitorData, result.mondayRecordUrl);

        // Track chat notification status
        if (result.mondayRecordId) {
          await this.mondayService.trackNotificationStatus(
            result.mondayRecordId.toString(),
            'chat',
            chatResult.success ? 'sent' : 'failed',
            chatResult.messageId
          );
        }

        return chatResult;
      }, onStepUpdate);

      // Step 6: Update final status
      await this.executeStep(steps[5], async () => {
        if (result.mondayRecordId) {
          const completedSteps = result.steps.filter(s => s.status === 'completed').length;
          const failedSteps = result.steps.filter(s => s.status === 'failed').length;

          return await this.mondayService.updateItem(result.mondayRecordId.toString(), {
            processing_status: `Complete (${completedSteps}/${result.totalSteps} steps successful)`,
            notification_status: failedSteps > 0 ? 'Some Failed' : 'All Sent',
            completed_at: new Date().toISOString()
          });
        }
        return { success: true, message: 'Final status updated' };
      }, onStepUpdate);

    } catch (error) {
      console.error('Pipeline execution failed:', error);
    }

    // Calculate final results
    result.completedSteps = result.steps.filter(step => step.status === 'completed').length;
    result.failedSteps = result.steps.filter(step => step.status === 'failed').length;
    result.success = result.failedSteps === 0 || (this.config.continueOnFailure && result.completedSteps > 0);

    return result;
  }

  private async executeStep(
    step: NotificationStep,
    operation: () => Promise<any>,
    onUpdate?: (step: NotificationStep) => void
  ): Promise<void> {
    while (step.attempts < step.maxAttempts) {
      step.attempts++;
      step.status = step.attempts > 1 ? 'retrying' : 'processing';
      step.startTime = new Date();

      onUpdate?.(step);

      try {
        // Execute with timeout
        const result = await Promise.race([
          operation(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timeout')), this.config.timeoutMs)
          )
        ]);

        step.result = result;
        step.status = 'completed';
        step.endTime = new Date();
        step.duration = step.endTime.getTime() - step.startTime.getTime();
        step.error = undefined;

        onUpdate?.(step);
        return;

      } catch (error) {
        step.error = error instanceof Error ? error.message : 'Unknown error';
        step.endTime = new Date();
        step.duration = step.endTime.getTime() - step.startTime.getTime();

        console.error(`Step ${step.id} failed (attempt ${step.attempts}/${step.maxAttempts}):`, error);

        // If not the last attempt, wait before retry
        if (step.attempts < step.maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs));
        } else {
          step.status = 'failed';
          onUpdate?.(step);

          if (!this.config.continueOnFailure) {
            throw error;
          }
        }
      }
    }
  }

  async retryFailedSteps(
    pipelineResult: NotificationPipelineResult,
    visitorData: CompleteRegistration,
    onStepUpdate?: (step: NotificationStep) => void
  ): Promise<NotificationPipelineResult> {
    const failedSteps = pipelineResult.steps.filter(step => step.status === 'failed');

    for (const step of failedSteps) {
      // Reset step for retry
      step.status = 'pending';
      step.attempts = 0;
      step.error = undefined;

      // Execute the specific step based on its ID
      switch (step.id) {
        case 'file-upload':
          await this.executeStep(step, async () => {
            return await this.fileUploadService.uploadVisitorFiles(visitorData);
          }, onStepUpdate);
          break;

        case 'host-email':
          await this.executeStep(step, async () => {
            return await this.emailService.sendHostNotification({
              hostName: visitorData.hostName!,
              hostEmail: visitorData.hostEmail!,
              visitorName: `${visitorData.firstName} ${visitorData.lastName}`,
              visitorEmail: visitorData.email!,
              visitorCompany: visitorData.companyName,
              visitTime: new Date().toLocaleString(),
              mondayRecordUrl: pipelineResult.mondayRecordUrl
            });
          }, onStepUpdate);
          break;

        case 'welcome-email':
          await this.executeStep(step, async () => {
            return await this.emailService.sendWelcomePackage(visitorData, {
              includePDF: !!visitorData.pdfBlob,
              includeStudioMap: true,
              includeWiFiInfo: true
            });
          }, onStepUpdate);
          break;

        case 'chat-notification':
          await this.executeStep(step, async () => {
            return await this.chatService.notifyTeamOfVisitor(visitorData, pipelineResult.mondayRecordUrl);
          }, onStepUpdate);
          break;
      }
    }

    // Recalculate results
    pipelineResult.completedSteps = pipelineResult.steps.filter(step => step.status === 'completed').length;
    pipelineResult.failedSteps = pipelineResult.steps.filter(step => step.status === 'failed').length;
    pipelineResult.success = pipelineResult.failedSteps === 0;

    return pipelineResult;
  }

  getStepStatusSummary(steps: NotificationStep[]): {
    completed: number;
    failed: number;
    processing: number;
    pending: number;
    total: number;
  } {
    return {
      completed: steps.filter(s => s.status === 'completed').length,
      failed: steps.filter(s => s.status === 'failed').length,
      processing: steps.filter(s => s.status === 'processing' || s.status === 'retrying').length,
      pending: steps.filter(s => s.status === 'pending').length,
      total: steps.length
    };
  }
}