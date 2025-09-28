# CallReady AI 2.0 🚀

**The AI-Powered Sales Call Intelligence Platform**

CallReady AI 2.0 is a production-ready SaaS application that transforms how sales professionals prepare for, execute, and follow up on sales calls. With unique AI-powered differentiators, it owns the entire sales call lifecycle.

## ✨ Unique Differentiators

### 🤖 AI Sales Call Companion Mode
- **Live Call Transcription** - Real-time speech-to-text during calls
- **AI Assistant** - Instant talking points, objection handling, and key notes
- **Follow-up Generation** - Automatic email drafts post-call
- **Chrome Extension Ready** - Seamless integration with video calls

### 🔍 Buyer Intent Signals
- **Real-time Intelligence** - Funding rounds, hiring trends, tech stack changes
- **External API Integration** - Crunchbase, LinkedIn Jobs, BuiltWith, News APIs
- **AI-Enhanced Briefs** - Context-aware pain points and talking points
- **Competitive Advantage** - Know what your prospects are thinking

### 🎯 Growth-Ready Features
- **Referral System** - 5 bonus briefs per successful referral
- **CRM Integrations** - HubSpot, Salesforce, Pipedrive export
- **Team Accounts** - Multi-seat billing and management
- **Analytics Dashboard** - Performance tracking and optimization

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Gemini 2.0 Flash
- **Payments**: Stripe Subscriptions
- **Email**: Resend API
- **Deployment**: Vercel
- **Monitoring**: Sentry (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API key
- Stripe account
- Resend API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/callready-ai.git
cd callready-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. **Set up the database**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 📋 Environment Variables

See [ENVIRONMENT_SETUP_V2.md](./ENVIRONMENT_SETUP_V2.md) for complete setup instructions.

### Required
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://...
GEMINI_API_KEY=your-gemini-key
RESEND_API_KEY=your-resend-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Optional (for enhanced features)
```bash
RAPIDAPI_KEY=your-rapidapi-key
CLEARBIT_API_KEY=your-clearbit-key
NEWS_API_KEY=your-news-api-key
HUBSPOT_API_KEY=your-hubspot-key
SALESFORCE_CLIENT_ID=your-salesforce-id
PIPEDRIVE_API_TOKEN=your-pipedrive-token
SENTRY_DSN=your-sentry-dsn
```

## 🎯 Core Features

### 1. AI-Powered Call Briefs
- **Smart Generation** - Context-aware briefs with buyer intent signals
- **Structured Output** - Prospect overview, pain points, talking points, questions
- **Export Options** - PDF, email, CRM integration
- **Brief History** - Track and manage all generated briefs

### 2. Companion Mode
- **Live Transcription** - Real-time speech recognition
- **AI Assistance** - Contextual talking points and objection handling
- **Note Capture** - Automatic key points extraction
- **Follow-up Generation** - Post-call email drafts

### 3. Buyer Intent Intelligence
- **Company Research** - Funding, hiring, tech stack, news analysis
- **Signal Integration** - AI incorporates signals into brief generation
- **Competitive Insights** - Market positioning and differentiation
- **Trend Analysis** - Industry-specific intelligence

### 4. Growth & Monetization
- **Referral System** - Viral growth with bonus briefs
- **Team Management** - Multi-seat billing and user management
- **Analytics Dashboard** - Performance tracking and optimization
- **CRM Integration** - Seamless workflow integration

## 📊 Pricing Plans

### Free Tier
- 5 AI-generated briefs per month
- Basic templates
- Copy brief functionality

### Pro Plan ($49/month)
- Unlimited AI briefs
- Advanced templates
- PDF export & email
- Brief history
- Priority support

### Enterprise (Custom)
- All Pro features
- Dedicated account manager
- Custom integrations
- SSO & advanced security
- Custom training

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy!

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Other Platforms
- **Railway** - Full-stack deployment
- **Render** - Database + app hosting
- **DigitalOcean** - VPS deployment
- **AWS** - Enterprise deployment

## 🔧 API Endpoints

### Core APIs
- `POST /api/briefs` - Generate AI brief
- `GET /api/briefs/[id]` - Get brief details
- `POST /api/briefs/[id]/pdf` - Export to PDF
- `POST /api/briefs/[id]/email` - Email brief

### Companion Mode
- `POST /api/companion/analyze` - Analyze call transcript
- `POST /api/companion/follow-up` - Generate follow-up email

### Buyer Intent
- `GET /api/buyer-intent/[company]` - Get company intelligence

### CRM Integration
- `POST /api/crm` - Export to CRM systems
- `GET /api/crm/status` - Check CRM connection status

### Referrals
- `POST /api/referrals` - Create referral
- `GET /api/referrals` - Get referral stats
- `POST /api/referrals/complete` - Complete referral

## 📈 Analytics & Monitoring

### Key Metrics
- Brief generation success rate
- AI API response times
- User conversion funnel
- Companion mode usage
- Referral conversion rate

### Health Checks
- `GET /api/health` - Application health
- `GET /api/debug` - Environment status

## 🔒 Security

- **Authentication** - NextAuth.js with secure sessions
- **API Security** - Rate limiting and input validation
- **Data Protection** - Encrypted sensitive data
- **HTTPS** - SSL/TLS encryption
- **Environment Variables** - Secure API key management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation** - Check the guides in this repository
- **Issues** - Report bugs via GitHub Issues
- **Email** - support@callreadyai.com
- **Discord** - Join our community server

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ AI Sales Call Companion Mode
- ✅ Buyer Intent Signals
- ✅ Referral System
- ✅ CRM Integrations

### Phase 2 (Q2 2024)
- 🔄 Chrome Extension
- 🔄 Advanced Analytics
- 🔄 Custom AI Models
- 🔄 Mobile App

### Phase 3 (Q3 2024)
- 📋 Enterprise Features
- 📋 Advanced Integrations
- 📋 White-label Solutions
- 📋 API Marketplace

## 🌟 Why CallReady AI?

**Traditional Sales Tools**: Static templates, manual research, disconnected workflows

**CallReady AI 2.0**: 
- 🤖 **AI-Powered Intelligence** - Dynamic, context-aware briefs
- 🔍 **Real-time Buyer Intent** - Know what prospects are thinking
- 📞 **Live Call Assistance** - AI companion during calls
- 🚀 **Growth-Focused** - Built-in viral mechanics
- 🔗 **Seamless Integration** - Works with your existing tools

**Result**: Sales professionals close more deals, faster, with less effort.

---

**Ready to transform your sales process?** 

🚀 [Deploy CallReady AI 2.0](https://vercel.com/new/clone?repository-url=https://github.com/your-username/callready-ai)

📧 [Get Started](mailto:hello@callreadyai.com)

🐦 [Follow Updates](https://twitter.com/callreadyai)

---

*Built with ❤️ for sales professionals who want to close more deals*