import type { CompleteRegistration } from '@/lib/validation';

export interface ChatMessage {
  text: string;
  cards?: Array<{
    header?: {
      title: string;
      subtitle?: string;
      imageUrl?: string;
    };
    sections: Array<{
      header?: string;
      widgets: Array<{
        textParagraph?: {
          text: string;
        };
        keyValue?: {
          topLabel: string;
          content: string;
          contentMultiline?: boolean;
          icon?: string;
        };
        buttons?: Array<{
          textButton: {
            text: string;
            onClick: {
              openLink: {
                url: string;
              };
            };
          };
        }>;
      }>;
    }>;
  }>;
}

export interface VisitorNotificationData {
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  hostName: string;
  hostEmail: string;
  arrivalTime: string;
  mondayRecordUrl?: string;
  photoUrl?: string;
}

export class GoogleChatService {
  private webhookUrl: string;
  private useMockMode: boolean;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || process.env.GOOGLE_CHAT_WEBHOOK || '';
    this.useMockMode = !this.webhookUrl || process.env.NODE_ENV === 'development';

    if (!this.useMockMode && !this.webhookUrl) {
      console.warn('GoogleChatService: No webhook URL provided, using mock mode');
      this.useMockMode = true;
    }

    if (this.useMockMode) {
      console.log('GoogleChatService: Running in mock mode');
    }
  }

  async sendMessage(message: ChatMessage): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (this.useMockMode) {
      console.log('Mock Google Chat Message:', JSON.stringify(message, null, 2));
      return {
        success: true,
        messageId: `mock-chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Google Chat API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        messageId: result.name || `chat-${Date.now()}`
      };
    } catch (error) {
      console.error('Google Chat send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Google Chat error'
      };
    }
  }

  createVisitorArrivalMessage(data: VisitorNotificationData): ChatMessage {
    const message: ChatMessage = {
      text: `🚶‍♂️ New visitor arrival at SQLA Studio`,
      cards: [
        {
          header: {
            title: `Visitor: ${data.visitorName}`,
            subtitle: `Host: ${data.hostName}`,
          },
          sections: [
            {
              header: 'Visitor Information',
              widgets: [
                {
                  keyValue: {
                    topLabel: 'Name',
                    content: data.visitorName,
                    icon: 'PERSON'
                  }
                },
                {
                  keyValue: {
                    topLabel: 'Email',
                    content: data.visitorEmail,
                    icon: 'EMAIL'
                  }
                },
                ...(data.visitorCompany ? [{
                  keyValue: {
                    topLabel: 'Company',
                    content: data.visitorCompany,
                    icon: 'BOOKMARK'
                  }
                }] : []),
                {
                  keyValue: {
                    topLabel: 'Arrival Time',
                    content: data.arrivalTime,
                    icon: 'CLOCK'
                  }
                }
              ]
            },
            {
              header: 'Host Information',
              widgets: [
                {
                  keyValue: {
                    topLabel: 'Host Name',
                    content: data.hostName,
                    icon: 'PERSON'
                  }
                },
                {
                  keyValue: {
                    topLabel: 'Host Email',
                    content: data.hostEmail,
                    icon: 'EMAIL'
                  }
                }
              ]
            },
            ...(data.mondayRecordUrl ? [{
              widgets: [
                {
                  buttons: [
                    {
                      textButton: {
                        text: 'View Monday.com Record',
                        onClick: {
                          openLink: {
                            url: data.mondayRecordUrl
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }] : [])
          ]
        }
      ]
    };

    return message;
  }

  createSimpleTextMessage(text: string): ChatMessage {
    return { text };
  }

  createVisitorCompletedMessage(data: VisitorNotificationData): ChatMessage {
    return {
      text: `✅ Visitor registration completed`,
      cards: [
        {
          header: {
            title: `${data.visitorName} - Registration Complete`,
            subtitle: `All documents processed and notifications sent`,
          },
          sections: [
            {
              header: 'Completed Actions',
              widgets: [
                {
                  textParagraph: {
                    text: `📝 NDA signed and processed\n📧 Welcome email sent to visitor\n📢 Host notification sent to ${data.hostName}\n📁 Files uploaded to Monday.com`
                  }
                },
                ...(data.mondayRecordUrl ? [{
                  buttons: [
                    {
                      textButton: {
                        text: 'View Complete Record',
                        onClick: {
                          openLink: {
                            url: data.mondayRecordUrl
                          }
                        }
                      }
                    }
                  ]
                }] : [])
              ]
            }
          ]
        }
      ]
    };
  }

  async notifyVisitorArrival(data: VisitorNotificationData): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const message = this.createVisitorArrivalMessage(data);
    return this.sendMessage(message);
  }

  async notifyVisitorCompleted(data: VisitorNotificationData): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const message = this.createVisitorCompletedMessage(data);
    return this.sendMessage(message);
  }

  async notifyTeamOfVisitor(visitorData: CompleteRegistration, mondayRecordUrl?: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const notificationData: VisitorNotificationData = {
      visitorName: `${visitorData.firstName} ${visitorData.lastName}`,
      visitorEmail: visitorData.email!,
      visitorCompany: visitorData.companyName,
      hostName: visitorData.hostName!,
      hostEmail: visitorData.hostEmail!,
      arrivalTime: new Date().toLocaleString(),
      mondayRecordUrl,
      photoUrl: visitorData.photoUrl
    };

    return this.notifyVisitorCompleted(notificationData);
  }

  // Utility method to send custom formatted messages
  async sendCustomMessage(
    title: string,
    content: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const message: ChatMessage = {
      text: title,
      cards: [
        {
          sections: [
            {
              widgets: [
                {
                  textParagraph: {
                    text: content
                  }
                },
                ...(actionUrl && actionText ? [{
                  buttons: [
                    {
                      textButton: {
                        text: actionText,
                        onClick: {
                          openLink: {
                            url: actionUrl
                          }
                        }
                      }
                    }
                  ]
                }] : [])
              ]
            }
          ]
        }
      ]
    };

    return this.sendMessage(message);
  }
}