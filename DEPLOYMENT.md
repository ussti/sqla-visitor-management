# SQLA Visitor Management - Deployment Guide

## Quick Deploy to Vercel

### 1. Prerequisites
- Vercel account
- GitHub repository
- Environment variables ready

### 2. Deploy Steps

#### Option A: GitHub Integration (Recommended)
1. Push code to GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project" → Select your GitHub repo
4. Configure environment variables (see below)
5. Deploy!

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Environment Variables
Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Monday.com Integration
MONDAY_API_TOKEN=eyJhbGciOiJIUzI1NiJ9...
MONDAY_VISITORS_BOARD_ID=1234567890
MONDAY_STAFF_BOARD_ID=0987654321

# Email Service (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=visitors@sqla-visitors.com
RESEND_FROM_NAME=SQLA Studio

# Google Chat Notifications
GOOGLE_CHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/...

# Security
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=your-32-character-secret-key-here

# Environment
NODE_ENV=production
```

### 4. Domain Configuration

#### Add Custom Domain:
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `sqla-visitors.com`
3. Configure DNS records (automatically provided by Vercel)
4. SSL certificate is automatic

#### DNS Records (if not using Vercel DNS):
```
Type: CNAME
Name: sqla-visitors
Value: cname.vercel-dns.com
```

### 5. Production Checklist

#### Before Go-Live:
- [ ] All environment variables set
- [ ] Domain configured and SSL working
- [ ] Monday.com boards created and configured
- [ ] Email DNS records configured (SPF, DKIM)
- [ ] Google Chat webhook tested
- [ ] Test registration flow end-to-end

#### Post-Deploy Testing:
1. **Basic Flow Test:**
   - Visit site → start registration
   - Fill personal info → organization → contact → host
   - Take photo → sign NDA → complete
   - Verify Monday.com record created
   - Check email notifications sent
   - Confirm Google Chat notification

2. **Performance Test:**
   - Test on iPad in landscape mode
   - Check photo capture quality
   - Verify signature pad works
   - Test offline/poor network scenarios

## Monitoring & Maintenance

### Built-in Monitoring:
- **Vercel Analytics**: Automatic performance monitoring
- **Error Tracking**: Console errors logged in Vercel Functions
- **Uptime**: Vercel provides 99.9% uptime SLA

### Manual Monitoring:
- Check Monday.com for new visitor records
- Monitor email delivery rates
- Test critical path monthly

### Troubleshooting Common Issues:

#### "API not working"
- Check environment variables in Vercel
- Verify Monday.com API token is valid
- Check function logs in Vercel dashboard

#### "Images not uploading"
- Verify Monday.com file upload permissions
- Check file size limits (max 10MB)
- Ensure proper file type (JPEG/PNG)

#### "Emails not sending"
- Verify Resend API key
- Check DNS records for domain
- Confirm sender email is verified

### Production URLs:
- **Main Site**: https://sqla-visitors.com
- **Admin/Test**: https://sqla-visitors.com/test
- **API Health**: https://sqla-visitors.com/api/test

---

## Development Mode

For local development:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

Environment variables in `.env.local`:
```bash
NODE_ENV=development
# API keys not required for local dev (uses mock services)
```