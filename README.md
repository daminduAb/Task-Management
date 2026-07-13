# Taskflow — Project & Team Task Management Platform

Full-stack, role-based task management platform.

**Tech stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui-style components · Framer Motion · Node.js + Express (TypeScript) · PostgreSQL + Prisma ORM · JWT auth · GitHub Actions CI/CD

---

## 1. What changed from a plain JS build

- **Full TypeScript** on both frontend and backend — typed Express requests (`AuthRequest`), typed Prisma models, typed React props/state. Catches bugs at compile time instead of runtime.
- **Tailwind CSS** for styling, with a custom design-token config (`tailwind.config.ts`) instead of inline styles.
- **shadcn/ui-style components** (`Button`, `Card`, `Input`, `Badge`, `Select`) hand-built with `class-variance-authority` — same pattern shadcn uses, no extra CLI dependency needed.
- **Framer Motion** for page-entrance fades and animated task-card transitions when tasks move between Kanban columns.
- **Design system**: cool-neutral canvas background, deep teal accent (not the generic purple/violet SaaS look), Space Grotesk for headings, Inter for body text, and — the signature detail — **JetBrains Mono ticket IDs** (`TSK-014`, `PRJ-002`) on every task/project card, giving a real sense of traceability like an actual issue tracker.

---

## 2. Project Structure

```
project-root/
├── backend/                    # Express API (TypeScript)
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── types/index.ts      # AuthRequest, JwtPayload
│   │   ├── config/db.ts        # Prisma client singleton
│   │   ├── middleware/         # auth.ts (JWT), role.ts (RBAC)
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── utils/validate.ts   # zod schemas
│   │   ├── seed.ts
│   │   └── index.ts
│   └── tests/auth.test.ts
├── frontend/                   # Next.js App Router (TypeScript)
│   └── src/
│       ├── app/
│       │   ├── layout.tsx      # fonts + AuthProvider
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   └── dashboard/{admin,pm,member}/page.tsx
│       ├── components/
│       │   ├── ui/             # Button, Card, Input, Badge, Select
│       │   ├── Navbar.tsx
│       │   ├── TaskBoard.tsx   # Kanban board w/ Framer Motion
│       │   └── ProtectedRoute.tsx
│       ├── context/AuthContext.tsx
│       ├── lib/{api.ts, utils.ts}
│       └── types/index.ts
├── .github/workflows/ci.yml
└── docs/
```

---

## 3. Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (local install or free hosted instance — Neon, Supabase, Railway)

### Backend

```bash
cd backend
cp .env.example .env
# edit .env: DATABASE_URL + a real JWT_SECRET

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed           # creates demo admin/pm/member + sample project
npm run dev            # ts-node + nodemon, http://localhost:5000
```

**Demo logins (password: `password123`):**
`admin@demo.com` · `pm@demo.com` · `member@demo.com`

### Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm install
npm run dev            # http://localhost:3000
```

### Production builds
```bash
# backend
npm run build && npm start

# frontend
npm run build && npm start
```

### Tests
```bash
cd backend
npm test        # Jest + Supertest, needs a reachable Postgres via DATABASE_URL
```

---

## 4. Design System Reference

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F6F7F9` | Page background |
| `surface` | `#FFFFFF` | Cards |
| `accent` | `#0F766E` | Primary actions, links |
| `priority.high/medium/low` | red / amber / green | Task priority badges |
| Display font | Space Grotesk | Headings |
| Body font | Inter | Everything else |
| Mono font | JetBrains Mono | Ticket IDs (`TSK-014`), timestamps |

All tokens live in `frontend/tailwind.config.ts` — change them there to re-theme the whole app.

---

## 5. API Overview

Same REST API as the JS version (unchanged endpoints, now with typed request/response shapes):

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users                      (Admin)
PUT    /api/users/:id/role             (Admin)
DELETE /api/users/:id                  (Admin)

GET    /api/projects
POST   /api/projects                   (Admin, PM)
GET    /api/projects/:id
PUT    /api/projects/:id               (owner PM, Admin)
DELETE /api/projects/:id               (owner PM, Admin)
POST   /api/projects/:id/members       (owner PM, Admin)
DELETE /api/projects/:id/members/:userId

GET    /api/projects/:projectId/tasks
POST   /api/projects/:projectId/tasks  (owner PM, Admin)

GET    /api/tasks/my
PUT    /api/tasks/:id/status
PUT    /api/tasks/:id                  (owner PM, Admin)
DELETE /api/tasks/:id                  (owner PM, Admin)
GET    /api/tasks/:id/comments
POST   /api/tasks/:id/comments
```

---

## 6. Database Design

See `docs/erd.png`. Core relationships unchanged from the JS build:
- `User` 1–N `Project` (owner), N–N via `ProjectMember`
- `Project` 1–N `Task`, `User` 1–N `Task` (assignee + creator)
- `Task` 1–N `TaskComment`
- `User` 1–N `ActivityLog`

---

## 7. CI/CD Pipeline

`.github/workflows/ci.yml` — two jobs, both on push/PR to `main`:

1. **Backend**: spins up a real Postgres service container → installs deps → generates Prisma client → runs migrations → **type-checks** (`tsc --noEmit`) → lints → runs Jest/Supertest → builds (`tsc`).
2. **Frontend**: installs deps → **type-checks** → lints → `next build`.

Type-checking is a separate CI step from linting/building — a type error fails the pipeline even if ESLint doesn't catch it.

---

## 8. Deployment

- **Frontend** → Vercel (native Next.js + App Router support)
- **Backend** → Railway / Render
- **Database** → Neon 

Live link: _add after deploying_

---




