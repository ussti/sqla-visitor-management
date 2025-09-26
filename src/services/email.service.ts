import { Resend } from 'resend';
import type { CompleteRegistration } from '@/lib/validation';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface HostNotificationData {
  hostName: string;
  hostEmail: string;
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  visitTime: string;
  mondayRecordUrl?: string;
}

export interface WelcomeEmailData {
  visitorName: string;
  visitorEmail: string;
  hostName: string;
  visitDate: string;
  studioInfo: {
    address: string;
    wifiPassword: string;
    emergencyContact: string;
  };
}

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;
  private useMockMode: boolean;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'visitors@sqla-visitors.com';
    this.fromName = process.env.RESEND_FROM_NAME || 'SQLA Studio';

    // Use mock mode in development or if API key is missing
    this.useMockMode = !apiKey || process.env.NODE_ENV === 'development';

    if (!this.useMockMode) {
      this.resend = new Resend(apiKey);
    } else {
      console.log('EmailService: Running in mock mode');
    }
  }

  async sendEmail(
    to: string | string[],
    template: EmailTemplate,
    attachments?: Array<{
      filename: string;
      content: Buffer | Uint8Array;
      contentType: string;
    }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (this.useMockMode) {
      console.log('Mock Email Sent:', {
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject: template.subject,
        attachments: attachments?.map(a => a.filename)
      });

      return {
        success: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    }

    try {
      const result = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject: template.subject,
        html: template.html,
        text: template.text,
        attachments: attachments?.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          type: attachment.contentType
        }))
      });

      return {
        success: true,
        messageId: result.data?.id
      };
    } catch (error) {
      console.error('Email send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  generateHostNotificationTemplate(data: HostNotificationData): EmailTemplate {
    const subject = `New Visitor Arrival: ${data.visitorName}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Visitor Notification</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .visitor-info { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; color: #666; }
            .cta-button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SQLA Studio</h1>
              <p>Visitor Notification</p>
            </div>

            <div class="content">
              <h2>Hello ${data.hostName},</h2>
              <p>You have a new visitor waiting for you at SQLA Studio.</p>

              <div class="visitor-info">
                <h3>Visitor Information</h3>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span>${data.visitorName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span>${data.visitorEmail}</span>
                </div>
                ${data.visitorCompany ? `
                <div class="info-row">
                  <span class="info-label">Company:</span>
                  <span>${data.visitorCompany}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="info-label">Arrival Time:</span>
                  <span>${data.visitTime}</span>
                </div>
              </div>

              ${data.mondayRecordUrl ? `
              <a href="${data.mondayRecordUrl}" class="cta-button">View Full Record</a>
              ` : ''}

              <p>Please come to the reception area to meet your visitor.</p>
            </div>

            <div class="footer">
              <p>SQLA Studio Visitor Management System</p>
              <p>This is an automated notification.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
SQLA Studio - Visitor Notification

Hello ${data.hostName},

You have a new visitor waiting for you at SQLA Studio.

Visitor Information:
- Name: ${data.visitorName}
- Email: ${data.visitorEmail}
${data.visitorCompany ? `- Company: ${data.visitorCompany}` : ''}
- Arrival Time: ${data.visitTime}

${data.mondayRecordUrl ? `View full record: ${data.mondayRecordUrl}` : ''}

Please come to the reception area to meet your visitor.

---
SQLA Studio Visitor Management System
This is an automated notification.
    `;

    return { subject, html, text };
  }

  generateWelcomeEmailTemplate(data: WelcomeEmailData): EmailTemplate {
    const subject = `Welcome to SQLA Studio - Visit Information`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to SQLA Studio</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .info-box { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; color: #666; }
            .highlight { background: #fffbf0; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to SQLA Studio</h1>
            </div>

            <div class="content">
              <h2>Hello ${data.visitorName},</h2>
              <p>Thank you for visiting SQLA Studio! We're excited to have you here.</p>

              <div class="info-box">
                <h3>Your Visit Details</h3>
                <div class="info-row">
                  <span class="info-label">Host:</span>
                  <span>${data.hostName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span>${data.visitDate}</span>
                </div>
              </div>

              <div class="info-box">
                <h3>Studio Information</h3>
                <div class="info-row">
                  <span class="info-label">Address:</span>
                  <span>${data.studioInfo.address}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">WiFi Password:</span>
                  <span>${data.studioInfo.wifiPassword}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Emergency Contact:</span>
                  <span>${data.studioInfo.emergencyContact}</span>
                </div>
              </div>

              <div class="highlight">
                <h4>Important Safety Guidelines</h4>
                <ul>
                  <li>Please wear your visitor badge at all times</li>
                  <li>Stay with your host throughout your visit</li>
                  <li>In case of emergency, contact security immediately</li>
                  <li>Please follow all studio policies and guidelines</li>
                </ul>
              </div>

              <p>If you have any questions during your visit, don't hesitate to ask your host or contact our reception.</p>
              <p>We hope you have a productive and enjoyable visit!</p>
            </div>

            <div class="footer">
              <p>SQLA Studio</p>
              <p>This email contains important information about your visit.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Welcome to SQLA Studio

Hello ${data.visitorName},

Thank you for visiting SQLA Studio! We're excited to have you here.

Your Visit Details:
- Host: ${data.hostName}
- Date: ${data.visitDate}

Studio Information:
- Address: ${data.studioInfo.address}
- WiFi Password: ${data.studioInfo.wifiPassword}
- Emergency Contact: ${data.studioInfo.emergencyContact}

Important Safety Guidelines:
- Please wear your visitor badge at all times
- Stay with your host throughout your visit
- In case of emergency, contact security immediately
- Please follow all studio policies and guidelines

If you have any questions during your visit, don't hesitate to ask your host or contact our reception.

We hope you have a productive and enjoyable visit!

---
SQLA Studio
    `;

    return { subject, html, text };
  }

  async sendHostNotification(data: HostNotificationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = this.generateHostNotificationTemplate(data);
    return this.sendEmail(data.hostEmail, template);
  }

  async sendWelcomeEmail(
    data: WelcomeEmailData,
    attachments?: Array<{
      filename: string;
      content: Buffer | Uint8Array;
      contentType: string;
    }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = this.generateWelcomeEmailTemplate(data);
    return this.sendEmail(data.visitorEmail, template, attachments);
  }

  async sendWelcomePackage(
    visitorData: CompleteRegistration,
    options: {
      includePDF?: boolean;
      includeStudioMap?: boolean;
      includeWiFiInfo?: boolean;
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const visitDate = new Date().toLocaleDateString();

    const welcomeData: WelcomeEmailData = {
      visitorName: `${visitorData.firstName} ${visitorData.lastName}`,
      visitorEmail: visitorData.email!,
      hostName: visitorData.hostName!,
      visitDate,
      studioInfo: {
        address: '123 Studio Drive, Los Angeles, CA 90210',
        wifiPassword: 'StudioGuest2024',
        emergencyContact: '+1 (555) 123-4567'
      }
    };

    const attachments: Array<{
      filename: string;
      content: Buffer | Uint8Array;
      contentType: string;
    }> = [];

    // Add NDA PDF if available and requested
    if (options.includePDF && visitorData.pdfBlob) {
      const pdfBuffer = await this.blobToBuffer(visitorData.pdfBlob);
      attachments.push({
        filename: visitorData.pdfFilename || 'NDA_Document.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    // Add studio materials if requested
    if (options.includeStudioMap) {
      attachments.push({
        filename: 'SQLA_Studio_Map.pdf',
        content: await this.generateStudioMapPDF(),
        contentType: 'application/pdf'
      });
    }

    if (options.includeWiFiInfo) {
      attachments.push({
        filename: 'WiFi_and_Access_Info.pdf',
        content: await this.generateWiFiInfoPDF(),
        contentType: 'application/pdf'
      });
    }

    return this.sendWelcomeEmail(welcomeData, attachments);
  }

  private async blobToBuffer(blob: Blob): Promise<Buffer> {
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async generateStudioMapPDF(): Promise<Buffer> {
    // Mock studio map PDF content
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(SQLA Studio Map - Coming Soon) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000204 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
298
%%EOF`;

    return Buffer.from(pdfContent, 'utf-8');
  }

  private async generateWiFiInfoPDF(): Promise<Buffer> {
    // Mock WiFi info PDF content
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 14 Tf
72 720 Td
(SQLA Studio - Visitor Information) Tj
0 -20 Td
/F1 12 Tf
(WiFi Network: SQLA-Guest) Tj
0 -15 Td
(Password: StudioGuest2024) Tj
0 -20 Td
(Emergency Contact: +1 (555) 123-4567) Tj
0 -15 Td
(Reception: +1 (555) 123-4568) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000204 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
454
%%EOF`;

    return Buffer.from(pdfContent, 'utf-8');
  }

  async sendVisitorCompleteNotification(visitorData: CompleteRegistration): Promise<{
    hostNotification: { success: boolean; messageId?: string; error?: string };
    welcomeEmail: { success: boolean; messageId?: string; error?: string };
  }> {
    const visitTime = new Date().toLocaleString();
    const visitDate = new Date().toLocaleDateString();

    // Send host notification
    const hostNotificationResult = await this.sendHostNotification({
      hostName: visitorData.hostName!,
      hostEmail: visitorData.hostEmail!,
      visitorName: `${visitorData.firstName} ${visitorData.lastName}`,
      visitorEmail: visitorData.email!,
      visitorCompany: visitorData.companyName,
      visitTime,
      mondayRecordUrl: undefined // Will be added later with Monday.com integration
    });

    // Send welcome email to visitor
    const welcomeEmailResult = await this.sendWelcomeEmail({
      visitorName: `${visitorData.firstName} ${visitorData.lastName}`,
      visitorEmail: visitorData.email!,
      hostName: visitorData.hostName!,
      visitDate,
      studioInfo: {
        address: '123 Studio Drive, Los Angeles, CA 90210',
        wifiPassword: 'StudioGuest2024',
        emergencyContact: '+1 (555) 123-4567'
      }
    });

    return {
      hostNotification: hostNotificationResult,
      welcomeEmail: welcomeEmailResult
    };
  }
}