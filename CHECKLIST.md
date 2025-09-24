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

### Day 2: Design System Implementation
- [ ] Install and configure Tailwind CSS
- [ ] Install Headless UI components
- [ ] Setup Poppins font family integration
- [ ] Create color scheme configuration (black bg, white text, logo accents)
- [ ] Build base layout components for iPad landscape orientation
- [ ] Create reusable UI component library
- [ ] Implement responsive design for large touch targets

### Day 3: Monday.com Integration Foundation
- [ ] Install Monday.com API client
- [ ] Create Monday.com service wrapper
- [ ] Implement authentication and connection testing
- [ ] Create board creation utilities
- [ ] **Create mock service for Monday.com API for local development**
- [ ] Build data models for Visitor Registry and Staff Directory
- [ ] Test API connection and basic operations
- [ ] Document Monday.com integration patterns

### Day 4: Internationalization Setup
- [ ] Install i18next and react-i18next
- [ ] Configure language detection and fallbacks
- [ ] Create translation files for English and Spanish
- [ ] Implement language switcher component
- [ ] Setup dynamic routing for locale support
- [ ] Test language switching functionality

### Day 5: Basic Routing and Navigation
- [ ] Implement Next.js app router structure
- [ ] Create main layout with language support
- [ ] Build welcome screen with language selection
- [ ] Setup navigation flow between registration steps
- [ ] Implement progress indicator component
- [ ] Test routing and navigation flow

## Week 2: Core Registration Features

### Day 6: Form Architecture
- [ ] Install React Hook Form and Zod validation
- [ ] Create form validation schemas
- [ ] Build multi-step form container component
- [ ] Implement form state management
- [ ] Create form persistence for session interruptions
- [ ] Setup error handling and user feedback

### Day 7: Personal Information Forms
- [ ] Build PersonalInfoForm component (Name, Surname)
- [ ] Implement real-time validation
- [ ] Create OrganizationForm component
- [ ] Add form navigation (Next/Previous buttons)
- [ ] Implement form data storage between steps

### Day 8: Email and Host Selection
- [ ] Build EmailForm with validation
- [ ] Implement returning visitor email suggestion
- [ ] Create Monday.com query for existing visitors
- [ ] Build HostSelectionForm with searchable dropdown
- [ ] Implement real-time staff directory filtering with server-side caching
- [ ] Add conditional logic for email auto-complete

### Day 9: Monday.com CRUD Operations
- [ ] Implement visitor record creation
- [ ] Build staff directory querying
- [ ] Create file upload functionality
- [ ] Implement status tracking for notifications
- [ ] Add error handling for API operations

### Day 10: Form Integration Testing
- [ ] Test complete multi-step form flow
- [ ] Verify Monday.com data storage
- [ ] Test conditional logic scenarios
- [ ] Validate form persistence across interruptions
- [ ] Check language switching in forms
- [ ] Performance test on iPad simulator

## Week 3: Advanced Features

### Day 11: NDA Template Integration
- [ ] Process client NDA template
- [ ] Build PDF preview component
- [ ] Implement auto-fill functionality (Date, Name)
- [ ] Create NDA review interface
- [ ] Add scroll-to-bottom requirement

### Day 12: Digital Signature Implementation
- [ ] Install and configure canvas signature pad
- [ ] Build signature capture component
- [ ] Implement signature validation (required)
- [ ] Add signature clear and retry functionality
- [ ] Optimize signature pad for iPad touch

### Day 13: Photo Capture System
- [ ] Implement browser camera API integration
- [ ] Build photo capture component
- [ ] Add biometric consent modal
- [ ] Implement photo preview and retake
- [ ] Create image processing pipeline (Canvas API)
- [ ] Add photo optimization (800x600, 85% quality, <500KB)

### Day 14: PDF Generation
- [ ] Install jsPDF for PDF creation
- [ ] Build NDA PDF generation with signature embedding
- [ ] Implement photo attachment to visitor records
- [ ] Create PDF filename convention (NDA_Name_Date.pdf)

### Day 15: File Management
- [ ] Implement Monday.com file upload
- [ ] Create asset management utilities
- [ ] Build file type validation
- [ ] Add file size optimization
- [ ] Test file storage and retrieval

## Week 4: Notification Systems

### Day 16: Resend Email Service
- [ ] Setup Resend API integration
- [ ] Configure DNS records (SPF/DKIM)
- [ ] Create email service wrapper
- [ ] Build email template system
- [ ] Implement host notification email

### Day 17: Welcome Package System
- [ ] Build welcome email template
- [ ] Implement PDF attachment functionality
- [ ] Create additional package materials (studio map, contact info, WiFi, safety guidelines)
- [ ] Setup automated email triggers
- [ ] Test welcome package delivery

### Day 18: Google Chat Integration
- [ ] Setup Google Chat webhook configuration
- [ ] Build chat notification service
- [ ] Implement message formatting
- [ ] Create Monday.com link integration in messages
- [ ] Test direct messaging to staff members

### Day 19: Notification Pipeline
- [ ] Build notification orchestration system
- [ ] Implement status tracking in Monday.com
- [ ] Create retry logic for failed notifications
- [ ] Add notification delivery confirmation
- [ ] Test complete notification flow

### Day 20: Error Handling and Recovery
- [ ] Build comprehensive error boundary components
- [ ] Implement API failure recovery
- [ ] Create user-friendly error messages
- [ ] Add system status indicators
- [ ] Test error scenarios and recovery

## Week 5: Production Readiness

### Day 21: Security and Compliance
- [ ] Implement GDPR/CCPA consent mechanisms
- [ ] Add privacy policy integration
- [ ] Create data deletion procedures (to be executed in Monday.com)
- [ ] Implement biometric data consent
- [ ] Add security headers and HTTPS enforcement

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

### Day 24: Production Deployment
- [ ] Configure Vercel deployment settings
- [ ] Setup environment variables in production
- [ ] Configure custom domain (sqla-visitors.com)
- [ ] Test SSL certificate and HTTPS redirect
- [ ] Implement monitoring and error tracking

### Day 25: Final Testing and Handover
- [ ] Conduct end-to-end testing on actual iPad
- [ ] Test all notification channels in production
- [ ] Verify Monday.com integration in live environment
- [ ] Create user training materials (for Monday.com usage)
- [ ] Provide system documentation to client