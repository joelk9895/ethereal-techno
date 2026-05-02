# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ethereal Techno** is a Next.js 15 full-stack application (codebase name: "pivot") for managing audio production content, artist portfolios, and producer networks. It uses MongoDB for persistence, AWS S3/SES for file storage and email, and Telegram for messaging. The application supports multiple user types (artists, producers, admins) with role-based features.

## Quick Commands

### Development
- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Build for production
- `npm start` — Run production server
- `npm run lint` — Run ESLint on the codebase

### Database
- `npx prisma migrate dev` — Create and apply migrations
- `npx prisma generate` — Regenerate Prisma client
- `npx prisma studio` — Open MongoDB Studio (GUI for database)

### Scripts
- `npm run create-admin` — Create an admin user (uses `scripts/create-admin.ts`)
- `ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/<script>.ts` — Run other utility scripts

## Architecture

### Core Structure

```
app/              - Next.js 15 App Router (pages and API routes)
├── api/          - REST API endpoints (auth, user, admin, content management)
├── admin/        - Admin dashboard pages and layouts
├── artist/       - Artist profile pages and components
├── components/   - Feature-specific components (import, Navbar, etc.)
└── page.tsx      - Landing page

lib/              - Shared utilities
├── auth.ts       - Client-side auth helpers (localStorage-based)
├── admin-auth.ts - Admin authorization logic
├── risk-engine.ts - Risk assessment for producers
└── utils.ts      - Common helpers

components/       - Reusable UI components
├── AdminGuard.tsx    - Admin route protection
├── Layout.tsx        - Main layout wrapper
└── Navbar.tsx        - Navigation bar

prisma/           - Database schema (MongoDB)
└── schema.prisma - All models defined here
```

### Data Models (Key Entities)

- **User** — Base entity with UserType (ARTIST, PRODUCER, ADMIN); stores auth, profile, preferences
- **Content** — Audio files/loops with metadata (contentType, soundGroup, status); linked to User
- **Loopandmidi** — Pairing of loop + MIDI content; can be part of ConstructionKit
- **Preset** — Reusable audio preset combining loop/midi/content
- **Constructionkit** — Bundle of loops, MIDI, presets; linked to products
- **Product** — Purchasable items containing content/kits; used in Order/OrderItem
- **Order** — Producer transactions (purchases of content)
- **File** — S3 file metadata with presigned URLs; linked to Content
- **News** — Admin-created content for the feed
- **Message** — Direct messaging between artists and producers
- **TelegramUser** — Telegram account linking for notifications

### Authentication & Authorization

- **Client-side auth** (`lib/auth.ts`) — Stores JWT token and user object in localStorage
- **Token flow** — Login returns `accessToken`; refresh endpoint renews it
- **Admin gate** (`components/AdminGuard.tsx`) — Route-level protection; checks user.type === 'ADMIN'
- **Server-side auth** (`lib/admin-auth.ts`) — Validates token in API routes, returns user context

### API Organization

- `/api/auth/*` — Login, signup, OTP, password reset, token refresh, logout
- `/api/user/*` — User profile, dashboard data
- `/api/admin/*` — Admin-only endpoints (users, producers, applications, content moderation)
- `/api/artist/*` — Artist-specific endpoints (profile, apply, messaging)
- `/api/producer/*` — Producer endpoints (profile, uploads, free packs, orders)
- `/api/content/*` — Content CRUD (creation, retrieval, streaming)
- `/api/import/*` — Content import workflow (uploads, ConstructionKit assembly)
- `/api/messages/*` — Direct messaging
- `/api/telegram/*` — Telegram bot integration (connect, disconnect, webhook)
- `/api/soundcloud/*` — SoundCloud integration
- `/api/sounds/*` — Sound retrieval and metadata

### External Integrations

- **AWS S3** — File storage; presigned URLs generated in `/api/import/upload` and producer upload endpoints
- **AWS SES** — Email service for password reset, OTP, notifications
- **MongoDB** — Data persistence; Prisma ORM
- **Telegram Bot (Grammy SDK)** — Message relay, notifications; webhook at `/api/telegram/webhook`
- **SoundCloud API** — Artist profile/track scraping via `/api/soundcloud`

### Frontend Components

- **Import flow** (`app/components/import/`) — Multi-step audio/construction kit import with drag-drop, metadata entry, and status tracking
- **Audio waveform** — Visual feedback for uploaded files
- **Navbar** — Navigation with role-based links
- **AdminGuard** — Protects admin routes
- **Layout** — Main wrapper with sidebar (if applicable)

## Development Patterns

### API Route Handlers

Standard pattern in `app/api/*/route.ts`:
1. Extract request body/query params
2. Authenticate via token validation (if needed)
3. Call Prisma to read/write
4. Return JSON response with status code

Example:
```typescript
export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await prisma.user.create({ data: { email, password: hashedPassword } });
  return Response.json({ user }, { status: 201 });
}
```

### Server-side Auth

Always validate `Authorization: Bearer <token>` header in protected endpoints:
```typescript
const token = req.headers.get("authorization")?.split(" ")[1];
const user = await verifyToken(token); // from lib/admin-auth.ts or similar
if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
```

### Client-side Auth

Use helpers from `lib/auth.ts`:
- `getAuthToken()` / `getAuthUser()` — Retrieve stored credentials
- `setAuthUser(user)` — Store user after login
- `clearAuth()` — Clear on logout
- `isAuthenticated()` — Check if logged in

### Fetching with Auth

Pattern for authenticated requests:
```typescript
const token = getAuthToken();
const response = await fetch("/api/endpoint", {
  headers: { "Authorization": `Bearer ${token}` },
});
```

### File Uploads

S3 flow via presigned URLs:
1. POST to `/api/import/upload` with file metadata → returns presigned URL + fileId
2. Client uploads directly to S3 using presigned URL
3. Client fetches content metadata after upload completes

## Database

### Prisma Workflow

- **Schema changes** — Edit `prisma/schema.prisma`, then run `npx prisma migrate dev` to generate migration and update client
- **Generate client** — `npx prisma generate` if schema changes don't auto-regenerate
- **Studio** — `npx prisma studio` opens web UI to inspect/edit data

### MongoDB Notes

- Uses `@id @default(uuid())` with `@map("_id")` for ID generation
- Relations use `fields` and `references` to link collections
- No native transactions; design with eventual consistency in mind
- Indexed fields help query performance; check `schema.prisma` for existing indexes

## Performance & Security

### Caching

- Next.js static assets (/_next/static/) cached for 1 year (immutable)
- S3 images cached for 30 days (configured in `next.config.ts`)
- API responses should set appropriate Cache-Control headers

### Security Headers

Configured in `next.config.ts`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Default Cache-Control: no-store (prevents caching of dynamic responses)

### Image Optimization

Allowed remote patterns:
- S3 (ethereal-techno-storage.s3.eu-west-1.amazonaws.com)
- SoundCloud (i1.sndcdn.com)
- Unsplash (images.unsplash.com)

## Testing

- No test suite currently in place; integration testing recommended before deployments
- Manual testing via dev server and browser
- `test-*.js` files in root are one-off debugging scripts (not automated tests)

## Deployment

- Built with `npm run build` (outputs to `.next/`)
- Run with `npm start` or deploy to Vercel
- Requires environment variables: DATABASE_URL, AWS credentials, Telegram token, etc.

## Common Tasks

### Adding a New API Endpoint

1. Create file: `app/api/[feature]/route.ts`
2. Implement handler (GET/POST/etc.)
3. Import Prisma client: `import { prisma } from "@/prisma/client"` (check actual export path)
4. Validate auth if needed
5. Return JSON response

### Adding a New Page

1. Create file: `app/[section]/page.tsx` (or `app/[section]/[dynamic]/page.tsx`)
2. Use Layout component if needed
3. Import auth helpers for conditional rendering
4. Fetch data in component or via API

### Modifying Database Schema

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <descriptive-name>`
3. Commit migration file and schema.prisma together

## Linting & Code Quality

- ESLint config extends "next/core-web-vitals" and "next/typescript"
- Run `npm run lint` to check all files
- Target: ES2017, strict TypeScript mode enabled
- Path alias `@/*` maps to root for imports

## Notes

- Admin users are created via `npm run create-admin` script
- Telegram notifications require bot token and webhook setup
- Risk engine (`lib/risk-engine.ts`) likely used for producer vetting or content moderation
- SoundCloud integration allows importing artist data (used in artist apply flow)
