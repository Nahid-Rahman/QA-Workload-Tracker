# QA Workload Tracker

A Vercel-ready Next.js app for QA team workload, availability, plan vs actual tracking, blocked task visibility, deadline risk, and urgent task planning.

## Current version

This is a demo/MVP web app with local browser storage. It works immediately after deployment without a database.

## Features

- QA dashboard summary
- Next 7 days availability heatmap
- Member-wise workload summary
- Who can take new work ranking
- Task management
- Daily planned vs actual allocation
- Leave, unavailability, and public holiday input
- Blocked task tracker
- Deadline risk list
- Urgent task planner

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Local browser storage for MVP data

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy on Vercel

Import this GitHub repository into Vercel. The default build command is `npm run build` and output is handled automatically by Next.js.

## Next phase ideas

- Supabase Auth
- Supabase/PostgreSQL database
- Role-based access for QA Lead and QA Members
- Export report to CSV/PDF
- PWA install support
