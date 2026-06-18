# QA Workload Tracker

A Vercel-ready Next.js app for QA team workload, availability, plan vs actual tracking, blocked task visibility, deadline risk, and urgent task planning.

## Current version

This MVP uses local browser storage. It works immediately after deployment without a database.

## Features

- QA dashboard summary
- Next 7 days availability heatmap
- Member-wise workload summary
- Who can take new work ranking
- Task management
- Inline task status update from task list
- Status-wise task filter
- Daily planned vs actual allocation
- Bulk / repeat allocation for multi-day work such as regression testing
- Leave, unavailability, and public holiday input
- Blocked task tracker
- Deadline risk list
- Urgent task planner
- Team member add/edit/deactivate
- Config menu for dropdown values

## Configurable dropdown values

The Config tab allows adding, renaming, or removing:

- Project / Module
- Work Types
- Skills
- Task Statuses
- Priorities
- Unavailable / Holiday Types
- Blocker Types

Renaming a config value updates existing records where possible.

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

Import this GitHub repository into Vercel. If the project is inside a subfolder, set Root Directory to:

```text
qa-workload-tracker
```

The default build command is `npm run build`.

## Next phase ideas

- Supabase Auth
- Supabase/PostgreSQL database
- Role-based access for QA Lead and QA Members
- Export report to CSV/PDF
- PWA install support

## Latest feature update

- Tasks table now shows the task start date.
- Daily Allocation has single-date and date-range filters.
- New History menu supports All Time, Today, Last 7 Days, Last 30 Days, Custom date range, and member-wise filtering.
- History can export the filtered result as CSV.
- Dashboard includes Lead Attention / Command Center and a copyable Daily Standup Summary.
- Bulk / repeat allocation supports long-running tasks such as regression testing across multiple days.
