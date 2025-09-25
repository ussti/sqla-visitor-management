import mondaySDK from 'monday-sdk-js';
import { Visitor } from '@/types/visitor';
import { StaffMember } from '@/types/staff';

const monday = mondaySDK();

export class MondayClient {
  private apiKey: string;
  private visitorBoardId: string;
  private staffBoardId: string;

  constructor() {
    this.apiKey = process.env.MONDAY_API_KEY || '';
    this.visitorBoardId = process.env.MONDAY_VISITORS_BOARD_ID || '';
    this.staffBoardId = process.env.MONDAY_STAFF_BOARD_ID || '';

    if (this.apiKey) {
      monday.setToken(this.apiKey);
    }
  }

  async testConnection(): Promise<{ success: boolean; user?: { id: string; name: string; email: string }; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'No API key configured' };
      }

      const query = 'query { me { id name email } }';
      const response = await monday.api(query);

      if (response.data?.me) {
        return {
          success: true,
          user: response.data.me
        };
      } else {
        return { success: false, error: 'Invalid API response' };
      }
    } catch (error) {
      console.error('Monday.com connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async query(query: string, variables?: Record<string, unknown>) {
    try {
      return await monday.api(query, { variables });
    } catch (error) {
      console.error('Monday.com query failed:', error);
      throw error;
    }
  }

  // Visitor Registry Board Operations
  async createVisitor(visitor: Omit<Visitor, 'id' | 'createdAt'>): Promise<{ id: string; name: string }> {
    const mutation = `
      mutation create_item($board_id: ID!, $item_name: String!, $column_values: JSON) {
        create_item(board_id: $board_id, item_name: $item_name, column_values: $column_values) {
          id
          name
        }
      }
    `;

    const columnValues = {
      text: `${visitor.name} ${visitor.surname}`,
      email: { email: visitor.email, text: visitor.email },
      text4: visitor.organization || '',
      text5: visitor.hostName,
      date: visitor.visitDate.toISOString().split('T')[0],
      status: { label: visitor.status }
    };

    const response = await this.query(mutation, {
      board_id: this.visitorBoardId,
      item_name: `${visitor.name} ${visitor.surname}`,
      column_values: JSON.stringify(columnValues)
    });

    return response.data.create_item;
  }

  async findVisitorByEmail(email: string): Promise<{ id: string; name: string; email: string } | null> {
    const query = `
      query get_board($board_id: ID!) {
        boards(ids: [$board_id]) {
          items {
            id
            name
            column_values {
              id
              text
              title
            }
          }
        }
      }
    `;

    const response = await this.query(query, { board_id: this.visitorBoardId });
    const items = response.data.boards[0]?.items || [];

    const visitor = items.find((item: { column_values: { title: string; text: string }[] }) => {
      const emailColumn = item.column_values.find(col => col.title === 'Email');
      return emailColumn?.text?.toLowerCase() === email.toLowerCase();
    });

    if (visitor) {
      const emailColumn = visitor.column_values.find((col: { title: string; text: string }) => col.title === 'Email');
      return {
        id: visitor.id,
        name: visitor.name,
        email: emailColumn?.text || ''
      };
    }

    return null;
  }

  async updateVisitorStatus(itemId: string, status: 'Registered' | 'Checked In'): Promise<void> {
    const mutation = `
      mutation change_column_value($board_id: ID!, $item_id: ID!, $column_id: String!, $value: JSON!) {
        change_column_value(board_id: $board_id, item_id: $item_id, column_id: $column_id, value: $value) {
          id
        }
      }
    `;

    // You'll need to replace 'status_column_id' with actual column ID from your board
    await this.query(mutation, {
      board_id: this.visitorBoardId,
      item_id: itemId,
      column_id: 'status',
      value: JSON.stringify({ label: status })
    });
  }

  // Staff Directory Board Operations
  async getStaffDirectory(): Promise<StaffMember[]> {
    const query = `
      query get_board($board_id: ID!) {
        boards(ids: [$board_id]) {
          items {
            id
            name
            column_values {
              id
              text
              title
            }
          }
        }
      }
    `;

    const response = await this.query(query, { board_id: this.staffBoardId });
    const items = response.data.boards[0]?.items || [];

    return items.map((item: { id: string; name: string; column_values: { title: string; text: string }[] }) => {
      const getColumnValue = (title: string) =>
        item.column_values.find(col => col.title === title)?.text || '';

      return {
        id: item.id,
        name: getColumnValue('Employee') || item.name,
        email: getColumnValue('Email'),
        jobTitle: getColumnValue('Job Title'),
        googleChat: getColumnValue('Google Chat'),
        isActive: getColumnValue('Status') === 'Active'
      };
    });
  }

  async findStaffMember(id: string): Promise<StaffMember | null> {
    const staff = await this.getStaffDirectory();
    return staff.find(member => member.id === id) || null;
  }

  // File Upload Operations
  async uploadFile(itemId: string, columnId: string, file: File): Promise<{ id: string }> {
    const mutation = `
      mutation add_file($file: File!, $item_id: ID!, $column_id: String!) {
        add_file_to_column(file: $file, item_id: $item_id, column_id: $column_id) {
          id
        }
      }
    `;

    const response = await this.query(mutation, {
      file,
      item_id: itemId,
      column_id: columnId
    });

    return response.data.add_file_to_column;
  }

  async uploadVisitorPhoto(itemId: string, photoFile: File): Promise<void> {
    await this.uploadFile(itemId, 'files', photoFile);
  }

  async uploadVisitorNDA(itemId: string, ndaFile: File): Promise<void> {
    await this.uploadFile(itemId, 'files__1', ndaFile);
  }
}

export const mondayClient = new MondayClient();