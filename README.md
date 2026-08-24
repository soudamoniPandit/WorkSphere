# Freelance Marketplace

A full-stack marketplace web app connecting clients with freelancers. Built with Next.js (App Router), TypeScript, and Supabase.

## What is this?

This platform lets clients post freelance jobs and hire talent, while freelancers can browse jobs, send proposals, and showcase their portfolio.

### Key Features
- **Authentication & Roles**: Role-based signup (Client vs Freelancer) with JWT auth.
- **Projects & Proposals**: Clients can create project listings with budgets, deadlines, and required skills. Freelancers can submit proposals with custom quotes.
- **Milestones & Contracts**: Track project deliverables and work contracts.
- **Messaging**: Direct messaging / chat between clients and freelancers for project discussion.
- **Reviews & Ratings**: Mutual feedback system after project completion.
- **Profiles & Portfolio**: Showcase past work and skill tags for freelancers; company info for clients.

---

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router, Server Actions / Route Handlers)
- **Database & API**: Supabase (PostgreSQL via HTTPS REST Client)
- **Auth**: JWT + bcrypt
- **Icons**: Lucide React

---

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd freelance-marketplace
```

### 2. Install dependencies
```bash
npm install
```

### 3. Database Setup (Supabase)
1. In your [Supabase Dashboard](https://supabase.com/dashboard), go to the **SQL Editor**.
2. Open `supabase-schema.sql` from the project root, paste it into the SQL Editor, and click **Run**.

### 4. Setup environment variables
Create a `.env` file in `freelance-marketplace/`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
SUPABASE_SECRET_KEY="<your-secret-key>"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
```

### 5. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```text
app/                  # Next.js App Router (pages & API routes)
  ├── api/            # Backend API endpoints (auth, projects, proposals, chat, etc.)
  ├── client/         # Client dashboard & management pages
  ├── freelancer/     # Freelancer dashboard & proposals
  ├── messages/       # Messaging interface
  ├── projects/       # Project browse & detail views
  └── profile/        # User profile view/edit
components/           # Reusable UI components
supabase-schema.sql   # 1-Click database SQL schema
src/                  # Server services, auth helpers, Supabase client
```
