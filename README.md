# Freelance Marketplace

A full-stack marketplace web app connecting clients with freelancers. Built with Next.js (App Router), TypeScript, PostgreSQL, and Prisma.

## What is this?

This platform lets clients post freelance jobs and hire talent, while freelancers can browse jobs, send proposals, and showcase their portfolio.

### Key Features
- **Authentication & Roles**: Role-based signup (Client vs Freelancer) with JWT auth.
- **Projects & Proposals**: Clients can create project listings with budgets, deadlines, and required skills. Freelancers can submit proposals with custom quotes.
- **Milestones**: Break projects down into trackable milestone deliverables with approval status.
- **Messaging**: Direct messaging / chat between clients and freelancers for project discussion.
- **Reviews & Ratings**: Mutual feedback system after project completion.
- **Profiles**: Portfolio showcase and skill tags for freelancers; company info for clients.

---

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router, Server Actions / Route Handlers)
- **Database**: PostgreSQL
- **ORM**: Prisma
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

### 3. Setup environment variables
Create a `.env` file in the root directory (or copy `.env.example`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/freelance_db?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/freelance_db?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
```

### 4. Push database schema
Push the Prisma schema to your PostgreSQL database:
```bash
npx prisma db push
```

*(Optional: generate client if needed)*
```bash
npx prisma generate
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
prisma/               # Database schema & migrations
src/                  # Server utilities, auth helpers, DB client
```
