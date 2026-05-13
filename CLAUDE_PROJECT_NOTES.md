# Hyrefy Project Notes

## Build Commands (Windows)
```powershell
# Always use E: drive for temp and npm cache (C: is full)
$env:TEMP = "E:\tmp"; $env:TMP = "E:\tmp"
npm install --legacy-peer-deps --cache E:\npm-cache
npm run db:generate  # (with TEMP=E:\tmp)
node "E:\projects\hyrefy\node_modules\next\dist\bin\next" build
```

## Stack
- Next.js 15 + TypeScript + Tailwind v4 + Framer Motion
- Clerk auth + Prisma + PostgreSQL + Claude AI + Stripe

## Key env vars
DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY,
ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_PREMIUM_PRICE_ID, STRIPE_WEBHOOK_SECRET
