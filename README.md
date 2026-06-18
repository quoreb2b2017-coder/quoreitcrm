# QuoreIt CRM — Recruitment ATS

A modern, full-stack Applicant Tracking System (ATS) and Recruiter CRM built for high-performance hiring teams.

## Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Recharts
- **Backend**: Node.js, Express, TypeScript, MongoDB/Mongoose
- **Shared**: Type definitions shared across frontend and backend
- **Real-time**: Socket.io for live messaging

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- (Optional) Cloudinary account for file uploads

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Shared types
cd ../shared && npm install

# Frontend
cd ../frontend/crm-frontend && npm install
```

### 2. Configure environment

**Backend** — copy `.env.example` to `.env` and fill in:
```
MONGODB_URI=mongodb://localhost:27017/quoreit
JWT_SECRET=your-secret-key
PORT=4000
```

**Frontend** — `.env.local` is pre-configured for local dev:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Run in development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — CRM Frontend
cd frontend/crm-frontend && npm run dev

# Terminal 3 — Public Website (optional)
cd frontend/public-website && npm run dev
```

Visit CRM: http://localhost:3000 | Public site: http://localhost:3002 | Open jobs: http://localhost:3002/open-jobs

## Features

- 🗂 **Kanban Pipeline** — Drag-and-drop candidate pipeline board
- 👥 **Candidate CRM** — Full candidate profiles, notes, calls, emails
- 💼 **Job Management** — Post, manage, and track open roles
- 🏢 **Client Management** — Multi-client support for agency recruiters
- 📁 **Projects** — Organize candidates by hiring projects
- 💬 **Real-time Messaging** — Live chat per job posting
- 📧 **Email Integration** — Send emails directly from the CRM
- 📞 **Call Logging** — Track candidate interactions
- 📊 **Analytics Dashboard** — Hiring velocity, pipeline stats
- 🔔 **Notifications** — Real-time message alerts

## Project Structure

```
quoreit-crm/
├── frontend/
│   ├── crm-frontend/     # CRM / ATS Next.js app
│   └── public-website/   # QuoreIT public marketing site
├── backend/              # Express API
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── ...
└── shared/               # Shared TypeScript types
```
