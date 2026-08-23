# 🚀 Freelance Marketplace — Complete System Architecture & Interview Revision Guide

This guide is designed for **quick revision and in-depth interview preparation**. It breaks down the system architecture, database modeling, and every single feature implementation with **intuitive Mermaid flowcharts**, business logic explanations, API flow, and key interview talking points.

---

## 📑 Table of Contents
1. [High-Level Architecture & Tech Stack](#1-high-level-architecture--tech-stack)
2. [Database Schema & ERD (Entity Relationships)](#2-database-schema--erd-entity-relationships)
3. [Feature 1: Authentication & Role-Based Access Control (RBAC)](#3-feature-1-authentication--role-based-access-control-rbac)
4. [Feature 2: Client Project Creation & Skill Tagging](#4-feature-2-client-project-creation--skill-tagging)
5. [Feature 3: Project Discovery, Filtering & Pagination](#5-feature-3-project-discovery-filtering--pagination)
6. [Feature 4: Proposal Bidding & Validation System](#6-feature-4-proposal-bidding--validation-system)
7. [Feature 5: Proposal Review & Atomic Acceptance Lifecycle](#7-feature-5-proposal-review--atomic-acceptance-lifecycle)
8. [Feature 6: Contextual Chat & Messaging System](#8-feature-6-contextual-chat--messaging-system)
9. [Feature 7: Profile Management & Skills Taxonomy](#9-feature-7-profile-management--skills-taxonomy)
10. [Feature 8: Role-Aware Dashboard & Analytics](#10-feature-8-role-aware-dashboard--analytics)
11. [Top Interview Questions & Architectural Concepts](#11-top-interview-questions--architectural-concepts)

---

## 1. High-Level Architecture & Tech Stack

### 🏗️ 3-Tier Layered Architecture
The application is structured using standard clean architecture principles to ensure high cohesion, low coupling, and testability.

```mermaid
graph TD
    Client[🖥️ Next.js Frontend App Router] -->|HTTP / JSON + JWT Bearer| API[🌐 Next.js Route Handlers /app/api/v1]
    API --> Controller[🎮 Server Controllers - Req/Res Validation]
    Controller --> Service[⚙️ Business Logic Services]
    Service --> AuthGuard[🛡️ Auth & RBAC Guards getAuthUser, requireRole]
    Service --> Prisma[💎 Prisma ORM Client + Transactions]
    Prisma --> DB[(🐘 PostgreSQL Database)]
```

### 🛠️ Technology Stack Breakdown
| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | Next.js 14 App Router, React, TailwindCSS, Lucide Icons | Responsive UI, Client Components, Dynamic State Management |
| **API Layer** | Next.js Route Handlers (`app/api/v1/...`) | RESTful API endpoints for auth, projects, proposals, chat, profile |
| **Business Logic** | TypeScript Controllers & Services (`src/lib/server/...`) | Decoupled business logic, validation, error handling |
| **Database & ORM** | PostgreSQL + Prisma ORM (`prisma/schema.prisma`) | Strongly-typed schema, migrations, relational queries & transactions |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` | Stateless session management, hashed credentials, role enforcement |

---

## 2. Database Schema & ERD (Entity Relationships)

```mermaid
erDiagram
    User ||--o| ClientProfile : "1-to-1"
    User ||--o| FreelancerProfile : "1-to-1"
    User ||--o{ Review : "gives / receives"
    User ||--o{ Notification : "receives"
    
    ClientProfile ||--o{ Project : "posts"
    
    FreelancerProfile ||--o{ FreelancerSkill : "has"
    FreelancerProfile ||--o{ PortfolioItem : "showcases"
    FreelancerProfile ||--o{ Proposal : "submits"
    
    Skill ||--o{ FreelancerSkill : "tagged in"
    Skill ||--o{ ProjectSkill : "required by"
    
    Project ||--o{ ProjectSkill : "requires"
    Project ||--o{ Proposal : "receives"
    Project ||--o{ Milestone : "contains"
    Project ||--o{ Conversation : "has context"
    
    Conversation ||--o{ Message : "contains"
```

### 🔑 Key Database Highlights
* **Dual-Profile Polymorphism**: A single `User` table holds authentication credentials and has a 1-to-1 relationship with either `ClientProfile` or `FreelancerProfile`.
* **Many-to-Many Skill Taxonomy**: `Skill` is a normalized entity connected to both `FreelancerProfile` (via `FreelancerSkill`) and `Project` (via `ProjectSkill`) through composite primary keys `[freelancerId, skillId]` and `[projectId, skillId]`.
* **Unique Constraints**:
  - `@@unique([projectId, freelancerId])` on `Proposal` prevents a freelancer from submitting duplicate bids to the same project.
  - `@@unique([projectId, clientId, freelancerId])` on `Conversation` guarantees a single chat room per project negotiation.

---

## 3. Feature 1: Authentication & Role-Based Access Control (RBAC)

### 📌 Summary
Provides secure registration, login, JWT token issuance, and server-side RBAC protection (`CLIENT`, `FREELANCER`, `ADMIN`).

### 🔄 Registration & Login Flowchart
```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User
    participant App as 🖥️ Next.js Frontend
    participant API as 🌐 /api/v1/auth/[register/login]
    participant Service as ⚙️ AuthService
    participant DB as 🐘 PostgreSQL (via Prisma $transaction)

    Note over User, DB: User Registration Flow
    User->>App: Submits Email, Password, Name, Role (CLIENT / FREELANCER)
    App->>API: POST /api/v1/auth/register
    API->>Service: AuthService.register(dto)
    Service->>DB: Check if email already exists
    alt Email already registered
        Service-->>App: 400 Bad Request ("Email already exists")
    else Email is new
        Service->>Service: Hash password using bcryptjs (salt rounds = 10)
        Service->>DB: $transaction(Create User + Create ClientProfile / FreelancerProfile)
        DB-->>Service: Created User Record
        Service->>Service: Generate JWT (userId, email, role)
        Service-->>App: Return User info + JWT Token
        App->>App: Store token in localStorage / Cookie & redirect to role dashboard
    end

    Note over User, DB: Protected Route Verification
    App->>API: GET /api/v1/projects (with Header: Bearer <token>)
    API->>Service: getAuthUser(req) -> verifyToken(token)
    alt Invalid / Expired Token
        API-->>App: 401 Unauthorized
    else Valid Token
        API->>Service: requireRole(user, [CLIENT, FREELANCER])
        Service-->>API: Authorized user payload
    end
```

### 💡 Interview Questions & Answers
* **Q: Why use `prisma.$transaction` during user registration?**
  * **A:** User registration creates two records: the core `User` record and the role-specific `ClientProfile` or `FreelancerProfile`. Using a transaction ensures **atomicity**; if profile creation fails, the user record is automatically rolled back, preventing orphaned or broken accounts.
* **Q: How does RBAC guard endpoints?**
  * **A:** We use helper functions `getAuthUser(req)` to extract and verify the JWT payload, and `requireRole(user, allowedRoles)` to check if the user's role satisfies the endpoint permissions (e.g. only `CLIENT` can post a project).

---

## 4. Feature 2: Client Project Creation & Skill Tagging

### 📌 Summary
Allows clients to publish project job postings with budget, deadline, detailed description, and a list of required technical skills.

### 🔄 Project Creation Flowchart
```mermaid
flowchart TD
    Start([Client clicks 'Post New Project']) --> Form[Fills: Title, Description, Budget, Deadline, Skills]
    Form --> Submit[POST /api/v1/projects with JWT]
    Submit --> AuthCheck{Is User Authenticated & Role == CLIENT?}
    AuthCheck -- No --> Deny[Return 403 Forbidden]
    AuthCheck -- Yes --> Transact[Start Prisma Transaction]
    
    Transact --> CreateProj[1. Create Project row with status = OPEN]
    CreateProj --> LoopSkills[2. For each skill string in skills array]
    
    LoopSkills --> UpsertSkill[Upsert Skill table: find existing or create new]
    UpsertSkill --> LinkSkill[Create ProjectSkill record linking projectId and skillId]
    LinkSkill --> MoreSkills{More skills?}
    MoreSkills -- Yes --> LoopSkills
    MoreSkills -- No --> FetchFull[3. Fetch complete Project with Client info & Skills]
    FetchFull --> Commit[Commit Transaction & Return 201 Created]
```

### 💡 Key Implementation Detail
* **Skill Upsert Logic:** Instead of hardcoding skill dropdowns, skills are upserted dynamically:
  ```typescript
  const skill = await tx.skill.upsert({
    where: { name: trimmedSkillName },
    update: {},
    create: { name: trimmedSkillName },
  });
  await tx.projectSkill.create({
    data: { projectId: project.id, skillId: skill.id },
  });
  ```
  This guarantees that skills are standardized and reused across projects and freelancer profiles.

---

## 5. Feature 3: Project Discovery, Filtering & Pagination

### 📌 Summary
Provides freelancers with a searchable, filterable feed of active job postings with server-side pagination.

### 🔄 Search & Query Flowchart
```mermaid
flowchart LR
    User[Freelancer Search Inputs] -->|Query Params| Route[GET /api/v1/projects]
    Route --> BuildQuery[Build Dynamic Prisma Where Clause]
    
    BuildQuery --> W1["Status: OPEN (Default)"]
    BuildQuery --> W2["Search: title OR description (contains, insensitive)"]
    BuildQuery --> W3["Skill: skills.some(skill.name == query)"]
    BuildQuery --> W4["Budget: minBudget <= budget <= maxBudget"]
    
    W1 & W2 & W3 & W4 --> Parallel[Execute Promise.all concurrently]
    Parallel --> Cnt[prisma.project.count whereClause]
    Parallel --> Find[prisma.project.findMany whereClause, skip, take, orderBy]
    
    Cnt & Find --> Calc[Calculate totalPages, hasNextPage, hasPrevPage]
    Calc --> Resp[Return Projects + Pagination Metadata]
```

### 💡 Interview Questions & Answers
* **Q: How is pagination implemented efficiently?**
  * **A:** We calculate `skip = (page - 1) * limit` and `take = limit`. We execute the `count` query and `findMany` query in parallel with `Promise.all([prisma.project.count(...), prisma.project.findMany(...)])`, cutting API latency in half.
* **Q: How are search queries optimized in PostgreSQL?**
  * **A:** We created Prisma indexes on `[status]`, `[clientId]`, and `[createdAt]` in `schema.prisma` (`@@index([status])`, `@@index([createdAt])`) to ensure rapid filtering and sorting.

---

## 6. Feature 4: Proposal Bidding & Validation System

### 📌 Summary
Allows qualified freelancers to submit competitive bids on open projects with proposed budget, estimated turnaround time, and a tailored cover letter.

### 🔄 Proposal Submission Flowchart
```mermaid
flowchart TD
    Start([Freelancer submits bid]) --> Req[POST /api/v1/projects/:id/proposals]
    Req --> CheckRole{User Role == FREELANCER?}
    CheckRole -- No --> Err1[403: Only freelancers can submit proposals]
    CheckRole -- Yes --> CheckProj{Project exists and status == OPEN?}
    CheckProj -- No --> Err2[400: Project not open for bidding]
    CheckProj -- Yes --> CheckOwner{Is freelancer the project owner?}
    CheckOwner -- Yes --> Err3[400: Cannot bid on own project]
    CheckOwner -- No --> CheckDuplicate{Existing proposal for projectId + freelancerId?}
    CheckDuplicate -- Yes --> Err4[400: Already submitted proposal]
    CheckDuplicate -- No --> CreateProp[Create Proposal with status = PENDING]
    CreateProp --> Success[Return 201 Created with Project & Freelancer info]
```

### 💡 Concurrency & Integrity Rule
* The database enforces `@@unique([projectId, freelancerId])`. Even under race conditions or double-clicks, the database rejects duplicate submissions with a unique constraint violation.

---

## 7. Feature 5: Proposal Review & Atomic Acceptance Lifecycle

### 📌 Summary
Clients review submitted proposals, shortlist candidates, or accept a winning bid. Accepting a proposal triggers an **atomic state machine transition**.

### 🔄 Proposal Status Lifecycle State Machine
```mermaid
stateDiagram-v2
    [*] --> PENDING: Freelancer submits bid
    PENDING --> SHORTLISTED: Client shortlists candidate
    SHORTLISTED --> ACCEPTED: Client accepts proposal
    PENDING --> ACCEPTED: Client directly accepts proposal
    PENDING --> REJECTED: Client declines or another bid is accepted
    SHORTLISTED --> REJECTED: Another candidate is accepted
    ACCEPTED --> [*]: Project is now IN_PROGRESS
```

### 🔄 Atomic Proposal Acceptance Flowchart
```mermaid
sequenceDiagram
    autonumber
    actor Client as 👔 Client
    participant API as 🌐 PATCH /api/v1/proposals/:id/status
    participant Service as ⚙️ ProposalService
    participant DB as 🐘 PostgreSQL ($transaction)

    Client->>API: Sends { status: "ACCEPTED" }
    API->>Service: updateProposalStatus(userId, proposalId, "ACCEPTED")
    Service->>DB: Verify user is the project owner
    Service->>DB: Start Prisma Transaction
    Note over Service, DB: Atomic Transition (All or Nothing)
    DB->>DB: 1. Update target proposal status to ACCEPTED
    DB->>DB: 2. Update Project status from OPEN to IN_PROGRESS
    DB->>DB: 3. Update all OTHER proposals for this project to REJECTED
    DB->>DB: 4. Upsert Conversation between Client & Freelancer
    DB-->>Service: Transaction committed
    Service-->>API: Return updated proposal payload
    API-->>Client: 200 OK (UI updates to Active Contract state)
```

### 💡 Interview Questions & Answers
* **Q: Why must proposal acceptance be wrapped in a transaction?**
  * **A:** If step 1 (accept proposal) succeeds, but step 2 (update project status) or step 3 (reject other proposals) crashes, the system enters an inconsistent state where multiple proposals appear accepted or the project remains open. The transaction guarantees **ACID atomicity**.

---

## 8. Feature 6: Contextual Chat & Messaging System

### 📌 Summary
Provides dedicated direct messaging between clients and freelancers **attached to a specific project**. Access is strictly gated by proposal progression.

### 🔄 Messaging Security & Flowchart
```mermaid
flowchart TD
    UserClick[User opens chat / sends message] --> ApiCall[POST /api/v1/conversations/:id/messages]
    ApiCall --> GetConv[Fetch Conversation by ID]
    GetConv --> ConvFound{Conversation exists?}
    ConvFound -- No --> Err1[404: Conversation not found]
    ConvFound -- Yes --> AuthParticipant{Is current user either the Client or Freelancer in this conversation?}
    AuthParticipant -- No --> Err2[403: Unauthorized to access this conversation]
    AuthParticipant -- Yes --> CheckAccessRule{Proposal status is SHORTLISTED or ACCEPTED?}
    CheckAccessRule -- No --> Err3[403: Messaging locked until proposal is shortlisted/accepted]
    CheckAccessRule -- Yes --> Transact[Start Transaction]
    
    Transact --> CreateMsg[1. Create Message record with senderId & content]
    CreateMsg --> TouchConv[2. Update Conversation.updatedAt = NOW]
    TouchConv --> ReturnMsg[Return 201 Created with sender profile]
```

### 💡 Anti-Spam Business Rule
* Freelancers **cannot spam clients** upon submitting bids. Direct messaging is only unlocked once the client explicitly **shortlists** or **accepts** the freelancer's proposal.

---

## 9. Feature 7: Profile Management & Skills Taxonomy

### 📌 Summary
Supports distinct profiles for Clients (company name, website, description, location) and Freelancers (title, hourly rate, bio, experience years, skills, portfolio items).

### 🔄 Freelancer Skill & Portfolio Synchronization
```mermaid
flowchart LR
    Submit[Freelancer updates profile skills] --> DeleteOld[Delete existing FreelancerSkill links for user]
    DeleteOld --> UpsertNew[For each skill: Upsert Skill master record]
    UpsertNew --> CreateNewLinks[Create new FreelancerSkill link records]
    CreateNewLinks --> Portfolio[Add / Delete Portfolio Items with project URLs & images]
    Portfolio --> Ready[Return updated profile with populated skills & portfolio]
```

---

## 10. Feature 8: Role-Aware Dashboard & Analytics

### 📌 Summary
Provides dynamic aggregated metrics tailored to the authenticated user's role in a single optimized endpoint (`/api/v1/dashboard`).

### 📊 Metric Aggregation Breakdown
```mermaid
graph TD
    User[User calls GET /api/v1/dashboard] --> RoleCheck{Role?}
    
    RoleCheck -->|Role == CLIENT| ClientStats[Client Metrics & Data]
    ClientStats --> CS1[Total Projects Count]
    ClientStats --> CS2[Open / In Progress / Completed Projects Count]
    ClientStats --> CS3[Total Proposals Received Count]
    ClientStats --> CS4[Shortlisted Proposals Count]
    ClientStats --> CS5[Recent 5 Projects & 5 Proposals with nested relations]

    RoleCheck -->|Role == FREELANCER| FreelancerStats[Freelancer Metrics & Data]
    FreelancerStats --> FS1[Available Open Projects Count]
    FreelancerStats --> FS2[My Submitted Proposals Count]
    FreelancerStats --> FS3[Pending / Shortlisted / Accepted Proposals Count]
    FreelancerStats --> FS4[Recent 5 Submitted Proposals]
    FreelancerStats --> FS5[5 Latest Matching Open Projects]
```

---

## 11. Top Interview Questions & Architectural Concepts

### 🎯 1. Architectural & Database Design
* **How did you prevent SQL Injection and Data Breaches?**
  * Prisma ORM uses parameterized queries exclusively, eliminating SQL injection vulnerabilities.
  * Passwords are never stored in plain text; they are salted and hashed with `bcryptjs`.
  * Sensitive fields like `password` are sanitized out before returning user DTOs to the client.

* **How do you handle relational cascading deletes?**
  * Configured `onDelete: Cascade` on child relations (e.g. deleting a `User` cascades to delete their `ClientProfile` / `FreelancerProfile`, `Projects`, `Proposals`, and `Messages`).

### 🎯 2. API & Error Handling
* **How is error handling centralized?**
  * A custom `AppError` class captures custom status codes (400, 401, 403, 404, 500).
  * Controllers wrap execution blocks in `try/catch` and standardize JSON error responses:
    ```json
    { "success": false, "error": "Descriptive error message" }
    ```

### 🎯 3. Performance & Scalability Considerations
* **Indexes:** Strategic composite indexes (`@@index([email])`, `@@index([status])`, `@@index([createdAt])`, `@@index([recipientId, isRead])`) minimize table scan overhead.
* **Non-blocking parallel queries:** Using `Promise.all` across independent database lookups drastically reduces API response times.
* **Separation of Concerns:** 
  - `Route Handlers` deal with HTTP headers and route params.
  - `Controllers` validate input types and payload schemas.
  - `Services` encapsulate business logic, domain rules, and DB transactions.
  - `Prisma` handles data persistence and relational mapping.

---
⭐ *Tip for the Interview: When explaining features, start with the business problem, describe the data entity relationships, mention the security guard rails (RBAC & validations), and highlight the transaction integrity (`$transaction`).*
