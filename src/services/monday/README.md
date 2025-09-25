# Monday.com Integration

## Overview
This module handles all interactions with Monday.com boards for the SQLA Visitor Management System.

## Architecture

### Service Pattern
- **MondayServiceAdapter**: Main interface that automatically switches between real API and mock data
- **MondayClient**: Real Monday.com API client
- **MockMondayService**: Mock implementation for development

## Configuration

### Environment Variables
```env
MONDAY_API_KEY=your_monday_api_token
MONDAY_VISITORS_BOARD_ID=18031944992
MONDAY_STAFF_BOARD_ID=18031998528
```

### Board Structure

#### Visitor Registry Board (18031944992)
- **Visitor** (text): Full name
- **Email** (email): Contact email
- **Organization** (text): Company/organization
- **Host** (text): Staff member name
- **Visit Date** (date): Date of visit
- **Status** (status): Registered | Checked In
- **Photo** (file): Visitor photo
- **NDA** (file): Signed NDA PDF

#### Staff Directory Board (18031998528)
- **Employee** (text): Staff member name
- **Email** (email): Contact email
- **Job Title** (text): Position/role
- **Google Chat** (text): Chat handle
- **Status** (status): Active | Inactive

## Usage

### Basic Operations

```typescript
import { mondayService } from '@/services/monday';

// Test connection
const result = await mondayService.testConnection();

// Get staff for host selection
const staff = await mondayService.getStaffDirectory();

// Create new visitor
const visitor = await mondayService.createVisitor({
  name: 'John',
  surname: 'Doe',
  email: 'john@company.com',
  organization: 'ABC Corp',
  hostId: '1',
  hostName: 'Sarah Johnson',
  visitDate: new Date(),
  status: 'Registered'
});

// Find existing visitor
const existing = await mondayService.findVisitorByEmail('john@company.com');

// Update status
await mondayService.updateVisitorStatus(visitor.id, 'Checked In');

// Upload files
await mondayService.uploadVisitorPhoto(visitor.id, photoFile);
await mondayService.uploadVisitorNDA(visitor.id, ndaFile);
```

### Development Mode

When `MONDAY_API_KEY` is not set in development, the service automatically uses mock data:

```typescript
// Check if using mock
if (mondayService.isUsingMock()) {
  console.log('Using mock data for development');
}

// Access mock data for debugging
const mockClient = mondayService.getRawClient();
if (mockClient instanceof MockMondayService) {
  console.log(mockClient.getAllMockData());
}
```

## Error Handling

All methods handle errors gracefully:

```typescript
try {
  const visitor = await mondayService.createVisitor(data);
} catch (error) {
  console.error('Failed to create visitor:', error);
  // Handle error appropriately
}
```

## Column ID Mapping

For file uploads, you may need to adjust column IDs in `client.ts`:

```typescript
// Update these in MondayClient class if needed
async uploadVisitorPhoto(itemId: string, photoFile: File): Promise<void> {
  await this.uploadFile(itemId, 'files', photoFile); // Photo column
}

async uploadVisitorNDA(itemId: string, ndaFile: File): Promise<void> {
  await this.uploadFile(itemId, 'files__1', ndaFile); // NDA column
}
```

## Testing

The mock service provides realistic data for testing:

- 4 sample staff members
- Simulated API delays
- Console logging for debugging
- Data persistence during session

## Next Steps

1. Test with real Monday.com boards
2. Verify column IDs match your board structure
3. Add error boundaries in UI components
4. Implement retry logic for failed requests