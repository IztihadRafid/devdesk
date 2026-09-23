# DevDesk

**AI-Powered Developer Collaboration & Issue Tracking Platform**

DevDesk is a full-stack SaaS platform for software teams to manage projects, track bugs, collaborate through real-time chat, and use AI-assisted tools for issue analysis and developer support. Built as a portfolio project demonstrating production-style architecture: authentication, role-based authorization, real-time infrastructure, and secure AI integration.

🔗 **Live demo:** https://devdesk-woad.vercel.app

---

## Features

- **Authentication** — Email/password and Google OAuth, powered by Auth.js
- **Role-Based Access Control (RBAC)** — Five roles per project (Owner, Admin, Developer, Tester, Viewer), enforced server-side on every request
- **Project Management** — Create projects, invite members by email, assign roles
- **Issue Tracking** — Full CRUD with type, status, priority, severity, labels, assignee, comments, and a full activity history
- **AI Bug Analyzer** — Sends an issue's details to an LLM and returns a possible cause, investigation suggestions, test cases, and edge cases — all clearly marked as AI suggestions, never auto-applied
- **AI Chat Assistant** — Conversational assistant for debugging/testing questions, with persistent conversation history
- **Real-time Chat** — Live project chat powered by Ably, with messages persisted in MongoDB
- **Notifications** — In-app notifications for assignments, status changes, and comments
- **Dashboard** — Issue statistics and charts (status breakdown, severity breakdown, recent activity)
- **Search** — Partial, case-insensitive search across projects and issues
- **Account Management** — Self-service account deletion (soft delete, preserves historical data as "Deleted User")

## Tech Stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| Frontend   | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend    | Next.js Route Handlers, Server Actions                    |
| Database   | MongoDB Atlas, Mongoose                                   |
| Auth       | Auth.js (NextAuth v5) — credentials + Google OAuth        |
| Real-time  | Ably (Pub/Sub)                                            |
| AI         | Groq (openai/gpt-oss-20b)                                 |
| Charts     | Recharts                                                  |
| Testing    | Vitest                                                    |
| Deployment | Vercel + MongoDB Atlas                                    |

## Architecture

Browser (React / Next.js client components)
│
▼
Next.js App Router
├─ Server Components — data fetching
├─ Route Handlers (/api/\*) — REST-style CRUD, all auth-checked
└─ Middleware — page-route protection (redirects unauthenticated users)
│
▼
Service layer (/lib)
├─ authz.ts — centralized RBAC permission map
├─ services/ai.service.ts — provider-agnostic AI abstraction
└─ services/activity.service.ts — activity logging + notifications
│
▼
Mongoose models → MongoDB Atlas

Real-time: client subscribes to Ably channel → server publishes on write → MongoDB stays source of truth
AI: client → Route Handler → AIService → Groq API → Zod-validated response → client (never auto-applied)

### Authorization model

Every project has a `members` array of `{ user, role }`. Permissions are defined once in `src/lib/authz.ts` as a role → permission map, and every API route checks the caller's role against it before performing any mutation — frontend checks exist only for UX, never as the actual security boundary.

## Database Schema

| Model            | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| `User`           | Account, credentials/OAuth, soft-delete flag          |
| `Project`        | Name, key, owner, members (with roles), issue counter |
| `Issue`          | Full bug/task tracking fields, linked to a project    |
| `Comment`        | Threaded on issues, author-editable                   |
| `Message`        | Project chat, persisted + published to Ably           |
| `Notification`   | Per-user, typed, read/unread                          |
| `Activity`       | Audit trail of project/issue changes                  |
| `AIConversation` | Stored AI Chat Assistant history                      |

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster
- A Google Cloud OAuth client
- A free Groq API key
- A free Ably API key

### Installation

```bash
git clone https://github.com/IztihadRafid/devdesk.git
cd devdesk
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=generate_with_npx_auth_secret
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GROQ_API_KEY=your_groq_api_key
ABLY_API_KEY=your_ably_api_key
```

### Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Run tests

```bash
npm test
```

## Security

- Server-side authorization on every mutating route — never trusts frontend role checks
- Passwords hashed with bcrypt; never logged or returned in API responses
- AI endpoints rate-limited per user
- Zod validation on all user input
- Generic error messages — no raw database errors exposed to clients
- Production cookies use `secure` + `httpOnly` flags over HTTPS

## Known Limitations / Future Improvements

- Rate limiting is in-memory (per server instance) — a multi-instance production deployment would use Redis/Upstash for a shared store
- Search uses MongoDB regex matching, adequate at this scale; a larger dataset would benefit from Atlas Search or a dedicated search index
- File attachments on issues were scoped out of the MVP
- AI Issue Generator and direct messages were deferred from the original spec to keep MVP scope realistic

## Engineering Decisions

- **Ably over raw Socket.IO** — Vercel's serverless functions can't hold persistent WebSocket connections; a managed pub/sub service avoided standing up and maintaining a separate always-on realtime server for a portfolio-scale project.
- **Soft-delete for user accounts** — hard-deleting a `User` document would leave dangling references across issues, comments, and activity logs. Soft-deleting (renaming to "Deleted User", blocking login) preserves historical data integrity without extra null-checking scattered across the UI.
- **AI service abstraction** — all AI calls route through a single `AIService`, so the underlying provider (currently Groq) can be swapped without touching route handlers.

---

Built by [Iztihad Rafid](https://github.com/IztihadRafid)
