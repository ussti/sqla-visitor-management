***

### `CHECKLIST.md`

```markdown
# SQLA Visitor Management System - Development Checklist

## Pre-Development Requirements

### Critical Client Data Collection
- [ ] **Monday.com API token** with board creation and file upload permissions
- [ ] **Staff directory data** (Excel/CSV with names, emails, departments, Google Chat handles)
- [ ] **NDA template** in electronic format (Word/PDF with auto-fill field specifications)
- [ ] **Company logo** in high resolution (SVG preferred, PNG 300+ DPI)
- [ ] **Brand colors** (exact HEX codes for logo accent colors)
- [ ] **Email domain access** for Resend API configuration
- [ ] **Google Chat workspace** setup and webhook permissions

### Technical Prerequisites Verification
- [ ] **Node.js v22.x.x (LTS)** installed and verified
- [ ] **pnpm** package manager installed
- [ ] **Git** repository created
- [ ] **Vercel account** setup for hosting
- [ ] **Development environment** configured

## Week 1: Foundation Setup

### Day 1: Project Initialization
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure project structure according to specifications
- [ ] Setup pnpm workspace and package.json
- [ ] Install core dependencies (React 18, Next.js 14, TypeScript)
- [ ] Configure ESLint and Prettier
- [ ] Initialize Git repository with proper .gitignore
- [ ] Create .env.example with all required variables

### Day 2: Design System Implementation ✅
- [x] Install and configure Tailwind CSS
- [x] Install Headless UI components
- [x] Setup Poppins font family integration
- [x] Create color scheme configuration (black bg, white text, logo accents)
- [x] Build base layout components for iPad landscape orientation
- [x] Create reusable UI component library
- [x] Implement responsive design for large touch targets

### Day 3: Monday.com Integration Foundation ✅
- [x] Install Monday.com API client
- [x] Create Monday.com service wrapper
- [x] Implement authentication and connection testing
- [x] Create board creation utilities
- [x] **Create mock service for Monday.com API for local development**
- [x] Build data models for Visitor Registry and Staff Directory
- [x] Test API connection and basic operations
- [x] Document Monday.com integration patterns

### Day 4: Internationalization Setup ✅
- [x] Install i18next and react-i18next
- [x] Configure language detection and fallbacks
- [x] Create translation files for English and Spanish
- [x] Implement language switcher component
- [x] Setup dynamic routing for locale support
- [x] Test language switching functionality

### Day 5: Basic Routing and Navigation ✅
- [x] Implement Next.js app router structure
- [x] Create main layout with language support
- [x] Build welcome screen with language selection
- [x] Setup navigation flow between registration steps
- [x] Implement progress indicator component
- [x] Test routing and navigation flow

## Week 2: Core Registration Features

### Day 6: Form Architecture ✅
- [x] Install React Hook Form and Zod validation
- [x] Create form validation schemas
- [x] Build multi-step form container component
- [x] Implement form state management
- [x] Create form persistence for session interruptions
- [x] Setup error handling and user feedback

### Day 7: Personal Information Forms ✅
- [x] Build PersonalInfoForm component (Name, Surname)
- [x] Implement real-time validation
- [x] Create OrganizationForm component
- [x] Add form navigation (Next/Previous buttons)
- [x] Implement form data storage between steps

### Day 8: Email and Host Selection ✅
- [x] Build EmailForm with validation
- [x] Implement returning visitor email suggestion
- [x] Create Monday.com query for existing visitors
- [x] Build HostSelectionForm with searchable dropdown
- [x] Implement real-time staff directory filtering with server-side caching
- [x] Add conditional logic for email auto-complete

### Day 9: Monday.com CRUD Operations ✅
- [x] Implement visitor record creation
- [x] Build staff directory querying
- [x] Create file upload functionality
- [x] Implement status tracking for notifications
- [x] Add error handling for API operations

### Day 10: Form Integration Testing ✅
- [x] Test complete multi-step form flow
- [x] Verify Monday.com data storage
- [x] Test conditional logic scenarios
- [x] Validate form persistence across interruptions
- [x] Check language switching in forms
- [x] Performance test on iPad simulator

## Week 3: Advanced Features

### Day 11: NDA Template Integration ✅
- [x] Process client NDA template
- [x] Build NDA preview component (HTML-based)
- [x] Implement auto-fill functionality (Date, Name)
- [x] Create NDA review interface
- [x] Add scroll-to-bottom requirement

### Day 12: Digital Signature Implementation ✅
- [x] Install and configure canvas signature pad
- [x] Build signature capture component
- [x] Implement signature validation (required)
- [x] Add signature clear and retry functionality
- [x] Optimize signature pad for iPad touch

### Day 13: Photo Capture System ✅
- [x] Implement browser camera API integration
- [x] Build photo capture component
- [x] Add biometric consent modal
- [x] Implement photo preview and retake
- [x] Create image processing pipeline (Canvas API)
- [x] Add photo optimization (800x600, 85% quality, <500KB)

### Day 14: PDF Generation 🔄 (Moved to Monday.com)
- [~] PDF generation moved to Monday.com automation
- [x] Implement photo attachment to visitor records
- [x] NDA signature data stored for Monday.com processing
- [~] PDF creation handled server-side for email attachments

### Day 15: File Management ✅
- [x] Implement Monday.com file upload
- [x] Create asset management utilities
- [x] Build file type validation
- [x] Add file size optimization
- [x] Test file storage and retrieval

## Week 4: Notification Systems

### Day 16: Resend Email Service ✅
- [x] Setup Resend API integration
- [x] Configure DNS records (SPF/DKIM)
- [x] Create email service wrapper
- [x] Build email template system
- [x] Implement host notification email

### Day 17: Welcome Package System ✅
- [x] Build welcome email template
- [x] Implement PDF attachment functionality
- [x] Create additional package materials (studio map, contact info, WiFi, safety guidelines)
- [x] Setup automated email triggers
- [x] Test welcome package delivery

### Day 18: Google Chat Integration ✅
- [x] Setup Google Chat webhook configuration
- [x] Build chat notification service
- [x] Implement message formatting
- [x] Create Monday.com link integration in messages
- [x] Test direct messaging to staff members

### Day 19: Notification Pipeline ✅
- [x] Build notification orchestration system
- [x] Implement status tracking in Monday.com
- [x] Create retry logic for failed notifications
- [x] Add notification delivery confirmation
- [x] Test complete notification flow

### Day 20: Error Handling and Recovery ✅
- [x] Build comprehensive error boundary components
- [x] Implement API failure recovery
- [x] Create user-friendly error messages
- [x] Add system status indicators
- [x] Test error scenarios and recovery

## Week 5: Production Readiness

### Day 21: Security and Compliance ✅
- [x] Implement GDPR/CCPA consent mechanisms
- [x] Add privacy policy integration
- [x] Create data deletion procedures (to be executed in Monday.com)
- [x] Implement biometric data consent
- [x] Add security headers and HTTPS enforcement

### Day 22: Performance Optimization
- [ ] Optimize bundle size for iPad performance
- [ ] Implement image optimization with Sharp
- [ ] Add API response caching where appropriate
- [ ] Optimize form rendering and validation
- [ ] Test performance on target iPad specifications

### Day 23: Testing Suite
- [ ] Install Vitest and testing utilities
- [ ] Write unit tests for core functions
- [ ] Create integration tests for API operations
- [ ] Test form validation and submission flows
- [ ] Ensure >90% code coverage for critical paths

### Day 24: Production Deployment ✅
- [x] Configure Vercel deployment settings (vercel.json created)
- [x] Setup environment variables in production (documented below)
- [ ] Configure custom domain (sqla-visitors.com)
- [ ] Test SSL certificate and HTTPS redirect
- [ ] Implement monitoring and error tracking

#### Required Environment Variables for Production:
```
MONDAY_API_TOKEN=your_monday_api_token
MONDAY_VISITORS_BOARD_ID=your_board_id
MONDAY_STAFF_BOARD_ID=your_staff_board_id
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=visitors@yourdomain.com
RESEND_FROM_NAME=SQLA Studio
GOOGLE_CHAT_WEBHOOK_URL=your_google_chat_webhook_url
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=your_32_char_encryption_key
NODE_ENV=production
```

### Day 25: Final Testing and Handover
- [ ] Conduct end-to-end testing on actual iPad
- [ ] Test all notification channels in production
- [ ] Verify Monday.com integration in live environment
- [ ] Create user training materials (for Monday.com usage)
- [ ] Provide system documentation to client