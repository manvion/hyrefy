# Hyrefy — AI Resume Optimizer

> Beat the ATS. Land more interviews. Hyrefy uses Claude AI to optimize your resume against any job description, score your ATS compatibility, and rewrite your bullets — in seconds.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion |
| UI Components | Radix UI primitives (ShadCN-style) |
| Authentication | Clerk |
| Database | PostgreSQL + Prisma ORM |
| AI | Claude API (claude-sonnet-4-6) |
| Payments | Stripe |
| Deployment | Vercel + Railway/Supabase/Neon |

## Features

- **Resume Upload** — PDF & DOCX with drag-and-drop, AI-powered parsing
- **ATS Scoring** — Keyword match, formatting, experience relevance scores
- **Job Description Analyzer** — AI extracts required skills and keywords
- **AI Rewriter** — 4 modes: Professional, Technical, Executive, Startup
- **Dashboard** — Usage tracking, scan history, resume management
- **Billing** — Stripe-powered Free/Premium tiers
- **Auth** — Clerk with Google + Email login

## Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd hyrefy
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Database Setup

```bash
# Create a PostgreSQL database (Railway, Supabase, or Neon)
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
```

### 4. Clerk Setup

1. Create app at [clerk.com](https://clerk.com)
2. Enable Google OAuth in Clerk dashboard
3. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local`

### 5. Anthropic Setup

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add `ANTHROPIC_API_KEY` to `.env.local`

### 6. Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Create a product: "Hyrefy Premium" — $19/month recurring
3. Copy the Price ID → `STRIPE_PREMIUM_PRICE_ID`
4. Add publishable + secret keys
5. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`, `customer.subscription.updated`
6. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
hyrefy/
├── app/
│   ├── (auth)/           # Sign in/up pages (Clerk)
│   ├── (dashboard)/      # Authenticated app pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── resume/       # Upload, history, detail
│   │   ├── analyze/      # ATS scoring page
│   │   ├── rewrite/      # AI rewriter page
│   │   ├── billing/      # Stripe billing
│   │   └── settings/     # Clerk user profile
│   ├── api/
│   │   ├── resume/       # Upload, list APIs
│   │   ├── analyze/      # ATS scoring API
│   │   ├── rewrite/      # AI rewriter API
│   │   ├── stripe/       # Checkout, portal, webhook
│   │   └── user/         # User sync, subscription
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Core UI components
│   ├── landing/          # Marketing page components
│   ├── dashboard/        # Dashboard layout components
│   ├── resume/           # Resume-specific components
│   └── shared/           # Shared utilities
├── lib/
│   ├── ai/               # Claude AI integration
│   │   ├── client.ts     # Anthropic SDK setup
│   │   ├── resume-parser.ts   # Resume parsing prompts
│   │   ├── ats-scorer.ts      # ATS scoring algorithm
│   │   └── rewriter.ts        # Resume rewrite prompts
│   ├── db/               # Prisma client
│   └── utils/            # File parser, Stripe, cn
├── prisma/
│   └── schema.prisma     # Database schema
└── types/
    └── index.ts          # TypeScript types
```

## Database Schema

- **users** — Clerk user data
- **subscriptions** — Free/Premium status, scan usage
- **resumes** — Uploaded files, parsed data
- **resume_scans** — ATS scores, job analysis results
- **resume_versions** — AI-rewritten versions

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/upload` | Upload & parse resume |
| `GET` | `/api/resume/list` | List user's resumes |
| `POST` | `/api/analyze` | Run ATS analysis |
| `GET` | `/api/analyze?scanId=` | Get scan results |
| `POST` | `/api/rewrite` | AI rewrite |
| `POST` | `/api/stripe/checkout` | Start subscription |
| `POST` | `/api/stripe/portal` | Manage subscription |
| `POST` | `/api/stripe/webhook` | Stripe webhooks |
| `GET` | `/api/user/subscription` | Get subscription status |
| `POST` | `/api/user/sync` | Sync Clerk user to DB |

## Pricing

| Plan | Price | Scans |
|------|-------|-------|
| Free | $0/mo | 3/month |
| Premium | $19/mo | Unlimited |

## Deployment

### Vercel (Frontend + API)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

### Database (Railway or Neon)

```bash
# Railway
railway login
railway new
railway add postgresql
railway run npm run db:push

# OR Neon (free tier)
# Create DB at neon.tech, copy connection string to DATABASE_URL
```

### Stripe Webhook (Production)

```bash
# Install Stripe CLI
stripe listen --forward-to https://yourdomain.com/api/stripe/webhook

# Or add webhook in Stripe dashboard
```

## Scaling Strategy

1. **File Storage**: Replace in-memory buffer with S3/R2 for file persistence
2. **Queue**: Add BullMQ/Upstash for background AI processing
3. **Caching**: Redis for repeated job description analysis
4. **Rate Limiting**: Upstash Redis rate limiter on AI endpoints
5. **Analytics**: PostHog for user behavior tracking
6. **Monitoring**: Sentry for error tracking

## License

MIT
