# SQLA Visitor Management System

Cost-effective iPad-optimized visitor registration system for Squeak E. Clean Studios, Los Angeles.

## Overview

The SQLA Visitor Management System replaces expensive third-party visitor management services with a custom web application designed specifically for studio environments. Built for iPad kiosk mode, the system handles visitor registration, digital NDA signing, photo capture, and automated staff notifications.

## Key Features

- **Multi-step visitor registration** with smart conditional logic
- **iPad camera integration** for visitor photos
- **Digital NDA signing** with canvas signature pad
- **Automatic PDF generation** with embedded signatures
- **Real-time staff notifications** via email and Google Chat
- **Bilingual interface** (English/Spanish)
- **Monday.com integration** as single source of truth
- **GDPR/CCPA compliant** data handling

## Tech Stack

- **Runtime:** Node.js v22.x.x (LTS)
- **Framework:** Next.js 14 + React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Headless UI
- **Package Manager:** npm
- **Database:** Monday.com API
- **Email:** Resend API
- **Notifications:** Google Chat webhooks
- **Hosting:** Vercel

## Architecture

### Data Flow
Visitor Registration → Photo Capture → NDA Signing → Monday.com Storage → Staff Notifications

### Monday.com Boards
- **Visitor Registry:** Complete visitor records with photos and signed NDAs
- **Staff Directory:** Employee database for host selection

### Notification Pipeline
- **Host Email:** Immediate notification with Monday.com record link
- **Google Chat:** Direct message to selected host employee
- **Welcome Package:** Automated email to visitor with attachments

## System Administration

System administration, including management of the Staff Directory, review of visitor logs, and processing of data deletion requests (GDPR/CCPA), is performed directly within the Monday.com workspace. No separate admin interface is provided within the application itself.

## Design System

- **Colors:** Black background, white text, logo accents
- **Typography:** Poppins font family
- **Layout:** Minimalist, Apple HIG-compliant
- **Responsive:** Landscape-optimized for iPad
- **Accessibility:** Large touch targets, clear navigation

## Environment Setup

### Prerequisites
```bash
# Ensure you are using a Long-Term Support (LTS) version of Node.js
node --version  # v22.x.x+
npm --version  # Latest stable

Installation
# Clone repository
git clone [repository-url]
cd sqla-visitor-management

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Configure API keys in .env.local

Environment Variables
# Monday.com Integration
MONDAY_API_KEY=your_monday_api_key
MONDAY_VISITORS_BOARD_ID=visitor_registry_board_id
MONDAY_STAFF_BOARD_ID=staff_directory_board_id

# Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=visitors@sqla-visitors.com

# Google Chat
GOOGLE_CHAT_WEBHOOK=your_google_chat_webhook

# Application
NEXT_PUBLIC_APP_URL=[https://sqla-visitors.com](https://sqla-visitors.com)
NEXT_PUBLIC_DEFAULT_LOCALE=en

Development Server
npm run dev
# Open http://localhost:3000

Performance Optimization

API Caching: The staff directory is cached on the server to reduce API calls to Monday.com, ensuring fast host selection and system resilience.

Image Optimization: Images are processed and optimized with Sharp to ensure fast uploads and minimal storage use.

Bundle Size: Minimal bundle size for optimal performance on iPad devices.

Security & Compliance

Data Protection

No Authentication Required: Public kiosk mode for visitor-facing interface.

Data Encryption: HTTPS for all communications.

Privacy Consent: Explicit checkboxes for data processing.

Biometric Data Consent: Specific consent is required for photo capture.

GDPR/CCPA Compliance

Clear privacy policy accessible from the main interface.

Right to deletion process handled via studio administration through Monday.com.

Deployment

Deployment is handled via Vercel, configured for automatic deployments from the Git repository. The production domain is sqla-visitors.com with SSL automatically managed by Vercel.
