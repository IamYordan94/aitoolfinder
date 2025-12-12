# aItoolfinder

A comprehensive directory of AI tools with search, filtering, and comparison features. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔍 Search and filter AI tools by category
- 📊 Compare up to 4 tools side-by-side
- 📱 Responsive design
- 🔄 Automated daily updates via cron jobs
- 💰 Google AdSense integration ready
- 🚀 Deployed on Vercel (free tier)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the SQL from `supabase/schema.sql`
4. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=your_adsense_id (optional)
ADMIN_SECRET_KEY=your_admin_secret_key (required for production)
```

### 4. Seed Initial Data

You can seed initial tools by running the seeding script (after setting up environment variables):

```bash
# You'll need to set up a script in package.json or run via Node
npx ts-node scripts/seed-tools.ts
```

Or manually add tools through the Supabase dashboard.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The cron job will automatically run daily at 6 AM UTC.

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── tools/        # Tools pages
│   ├── compare/      # Comparison page
│   └── page.tsx      # Homepage
├── components/       # React components
├── lib/             # Utilities and helpers
├── types/           # TypeScript types
└── supabase/        # Database schema
```

## Monetization

### Primary: Google AdSense (Ad-Only Model)
- ✅ **Already Integrated**: Just add your AdSense ID to `.env.local`
- **Setup**: Apply at [Google AdSense](https://www.google.com/adsense/)
- **Revenue**: $1-10 per 1,000 page views (varies by traffic)

### Secondary: Affiliate Links
- Add affiliate links to "Try Tool" buttons
- **Revenue**: $5-50 per signup + recurring commissions
- **Top Programs**: ChatGPT, Midjourney, Jasper, Copy.ai, Grammarly

### Future: Sponsored Listings
- Tools pay for featured placement
- **Revenue**: $50-500/month per sponsored tool

**See `PHASE3-MONETIZATION.md` for detailed revenue projections and strategies.**

## Contributing

Feel free to submit issues or pull requests!

## License

MIT
