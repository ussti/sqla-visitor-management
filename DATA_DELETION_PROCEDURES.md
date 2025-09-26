# Data Deletion Procedures
## SQLA Visitor Management System

### Overview
This document outlines the procedures for handling data deletion requests in compliance with GDPR, CCPA, and other privacy regulations.

### Data Retention Policy
- **Visitor Records**: Retained for 2 years for security and compliance purposes
- **Biometric Data (Photos)**: Retained with visitor records for identification
- **Email Communications**: Retained in email service provider logs (30 days)
- **Consent Records**: Retained for legal compliance (7 years)

### Data Storage Locations
1. **Monday.com Boards**:
   - Visitor Registry Board (primary visitor data)
   - Staff Directory Board (employee information)
   - File attachments (photos, signed NDAs)

2. **Session Storage** (temporary):
   - Form data during registration
   - Consent preferences
   - Automatically cleared on session end

3. **Email Service (Resend)**:
   - Sent email logs and content
   - Delivery status records

### Deletion Request Process

#### 1. Request Receipt
- Requests received via email: privacy@sqla.com
- Document request with timestamp and requester verification

#### 2. Identity Verification
- Verify requester identity using:
  - Email address on record
  - Name and company information
  - Visit date (if available)

#### 3. Data Location Identification
- Search Monday.com boards for visitor records
- Identify associated files (photos, NDAs)
- Check email service logs

#### 4. Manual Deletion Steps

##### Monday.com Data Deletion:
```bash
# Access Monday.com workspace
# Navigate to Visitor Registry board
# Search for visitor by email/name
# Delete visitor record row
# Delete associated files from Files column
# Check Staff Directory for any cross-references
```

##### File Storage Deletion:
```bash
# Delete uploaded files from Monday.com storage
# Files are automatically removed when record is deleted
# Verify file deletion in Monday.com trash/recycle bin
```

##### Email Service Cleanup:
```bash
# Contact Resend support for email log deletion
# Provide specific email addresses and date ranges
# Document confirmation of deletion
```

#### 5. Verification Steps
- Confirm record deletion in Monday.com
- Verify file removal from storage
- Document completion with screenshots
- Send confirmation email to requester

#### 6. Documentation Requirements
- Log deletion request in compliance tracking sheet
- Record completion date and method
- Maintain deletion confirmation for audit purposes

### Automated Deletion (Future Implementation)
Currently, all deletions are manual. Future versions may include:
- Automated data retention policies
- Scheduled cleanup of expired records
- API endpoints for deletion requests

### Special Considerations

#### Legal Hold Scenarios
If data is subject to legal proceedings:
- Consult legal counsel before deletion
- Document legal hold status
- Preserve data until cleared by legal

#### Incomplete Deletions
If some data cannot be deleted immediately:
- Document reasons and timeline
- Communicate delays to requester
- Provide regular status updates

#### Backup Data
- Monday.com maintains system backups
- Request deletion from backup systems
- Confirm with Monday.com support

### Contact Information
- **Privacy Officer**: privacy@sqla.com
- **Technical Contact**: dev@sqla.com
- **Legal Department**: legal@sqla.com

### Compliance Notes
- All deletions must be completed within 30 days
- Requester must be notified of completion
- Maintain records of deletion requests for compliance
- Review and update procedures annually

### Emergency Contact
For urgent deletion requests or data breaches:
- Contact Monday.com support immediately
- Disable API access if necessary
- Document incident and response actions

---
*Last Updated: January 2025*
*Next Review: January 2026*