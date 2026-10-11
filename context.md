# portfolioCMS — Technical Architecture & Project Context

> **Living Documentation**: This file serves as the single source of truth for the project's architecture, database configuration, schema models, API design, security posture, and changelog. Update this file whenever modifications are made to the codebase.

---

## 1. Executive Summary & Overview

**portfolioCMS** is a developer-first headless Content Management System (CMS) and API platform. It enables creators and developers to manage dynamic content collections (projects, blog posts, skills, testimonials, certifications, etc.) via a modern web interface and serve them to external client applications through dedicated REST API endpoints.

- **Frontend**: React 19, Vite 7, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend**: Express 4, Node.js (executed via `tsx`), TypeScript.
- **ORM / Database**: Prisma ORM v6.19.3 targeting PostgreSQL hosted on **Neon**.
- **Authentication**: Firebase Authentication (Client SDK) with Firebase Admin SDK verification on the backend + signed JWT session tokens for API/Dashboard requests.
- **Architecture Pattern**: Fully dynamic headless collection model (`User` -> `Section` -> `ContentItem`). All content types (including Projects and Posts) are treated as customizable and deletable collections.

```
Client (React 19 + Vite 7)
    │
    ▼ (Firebase Client SDK Auth)
Firebase Auth (Google OAuth / Email-Password)
    │
    ▼ (Bearer ID Token to /api/auth/firebase-sync)
Express Server (server/index.ts)
    ├── Firebase Admin SDK (server/auth.ts) verifies ID token
    ├── Prisma Client (server/db.ts) upserts User & generates API Key
    └── Issues 7-day session JWT
    │
    ▼ (Database connection via DATABASE_URL / DIRECT_URL)
PostgreSQL Database (Neon Cloud)
    ├── User
    ├── ApiKey
    ├── Section (Projects, Posts, Skills, Custom...)
    └── ContentItem (Records with native JSON dynamic fields)
```

---

## 2. Database Configuration & Connection Details

### Configuration Files & URLs
- **Datasource definition**: Defined in `server/prisma/schema.prisma`.
  - `url = env("DATABASE_URL")`: Connection string for running queries. Targets the Neon pooled connection (`...-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require`).
  - `directUrl = env("DIRECT_URL")`: Direct non-pooled connection for migrations and DDL operations (`...ep-frosty-river-b4nplupp.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require`).
- **Prisma Client Initialization**: Configured in `server/db.ts` using the global singleton pattern to avoid connection leaks across hot-reloads in development.
- **Config file notes**: `prisma.config.ts` does not exist in this project; configuration is driven by `schema.prisma` and `.env`.

---

## 3. Prisma Schema & Models Reference (Unified Architecture)

The schema is defined in `server/prisma/schema.prisma` with **4 core models**:

### 3.1. `User`
Stores registered developers and account metadata.
- `id`: `String` (CUID, Primary Key)
- `email`: `String` (`@unique`)
- `name`: `String`
- `avatar`: `String?`
- `firebaseUid`: `String?` (`@unique`)
- `apiSlug`: `String` (`@unique`, CUID default) — identifies the user's public API routes (e.g., `/api/v1/:apiSlug/...`)
- `role`: `String` (`@default("user")`)
- `plan`: `String` (`@default("Pro")`)
- `createdAt` / `updatedAt`: `DateTime`
- **Relations**: `apiKeys ApiKey[]`, `sections Section[]`, `contentItems ContentItem[]`

### 3.2. `ApiKey`
Stores API credentials used by external apps to query a user's content.
- `id`: `String` (CUID, Primary Key)
- `name`: `String`
- `token`: `String` (`@unique`) — token (`phq_live_...`)
- `keyPrefix`: `String` (`@default("phq_live_")`)
- `role`: `String` (`@default("Read-Only")`) — `"Read-Only"` or `"Read & Write"`
- `status`: `String` (`@default("Active")`)
- `lastUsed`: `DateTime?` — Timestamp of last key usage
- `userId`: `String` (Foreign Key referencing `User.id` with `onDelete: Cascade`)
- `createdAt`: `DateTime`
- **Indexes**: `@@index([userId])`

### 3.3. `Section` (Universal Collections)
Defines any content collection (whether "Projects", "Blog Posts", "Skills", "Services", etc.).
- `id`: `String` (CUID, Primary Key)
- `name`: `String` — display title (e.g., "Projects", "Blog Posts", "Skills")
- `singularName`: `String` — singular title (e.g., "Project", "Blog Post", "Skill")
- `slug`: `String` — URL route slug (e.g., `projects`, `posts`, `skills`)
- `icon`: `String` (`@default("layers")`) — Lucide icon identifier
- `description`: `String?`
- `fields`: `Json` (`@default("[]")`) — native PostgreSQL JSON array of field definitions
- `userId`: `String` (Foreign Key referencing `User.id` with `onDelete: Cascade`)
- `createdAt` / `updatedAt`: `DateTime`
- **Constraints**: `@@unique([userId, slug])` ensures slug uniqueness per user.
- **Indexes**: `@@index([userId])`
- **Relations**: `items ContentItem[]` (deleting a Section cascades and deletes all its items).

### 3.4. `ContentItem` (Universal Records)
Stores records belonging to ANY section.
- `id`: `String` (CUID, Primary Key)
- `sectionId`: `String` (Foreign Key referencing `Section.id` with `onDelete: Cascade`)
- `userId`: `String` (Foreign Key referencing `User.id` with `onDelete: Cascade`)
- `title`: `String` — title/name of the item
- `slug`: `String?` — optional item-level URL slug (e.g. for articles or project case studies)
- `status`: `String` (`@default("Live")`) — `"Live"`, `"Draft"`, or `"Archived"`
- `category`: `String?`
- `summary`: `String?`
- `data`: `Json` (`@default("{}")`) — native PostgreSQL JSON for all dynamic/custom attributes
- `createdAt` / `updatedAt`: `DateTime`
- **Indexes**: `@@index([userId])`, `@@index([sectionId])`, `@@index([userId, sectionId])`
- **Constraints**: `@@unique([userId, sectionId, slug])`

---

## 4. API Routes & Endpoints Reference

### Authentication
- `POST /api/auth/firebase-sync`: Synchronizes Firebase user to PostgreSQL, provisions initial API key if absent, returns signed JWT.
- `GET /api/auth/me`: Validates session JWT and returns user profile, `apiSlug`, and primary API key.
- `POST /api/auth/google`, `POST /api/auth/signup`, `POST /api/auth/login`: Return HTTP 410 (redirects to Firebase SDK).

### Core Section Management (Scoped: `/api/v1/:apiSlug`)
Protected by `authenticateApiRequest` (supports Bearer JWT, `x-api-key` header, or `?apiKey=` query param).
- `GET /api/v1/:apiSlug/sections`: Lists all user sections (auto-creates default Projects and Posts if user has none).
- `POST /api/v1/:apiSlug/sections`: Creates or updates a section definition.
- `PUT /api/v1/:apiSlug/sections/:id`: Updates an existing section with ownership verification (IDOR protected).
- `DELETE /api/v1/:apiSlug/sections/:id`: Deletes ANY section (including Projects, Posts, or custom sections) and cascades all items.
- `GET /api/v1/:apiSlug/keys`: Lists API keys.
- `POST /api/v1/:apiSlug/keys`: Generates a new API key (enforces one per user).
- `DELETE /api/v1/:apiSlug/keys/:id`: Revokes/deletes an API key.

### Universal Collection Endpoints (Scoped: `/api/v1/:apiSlug/:sectionSlug`)
Works identically for ANY collection (whether `projects`, `posts`, `skills`, `testimonials`, etc.):
- `GET /api/v1/:apiSlug/:sectionSlug`: Fetches items in the section (supports `?status=` and `?limit=`).
- `GET /api/v1/:apiSlug/:sectionSlug/:id`: Fetches a single item by ID or slug.
- `POST /api/v1/:apiSlug/:sectionSlug`: Creates an item in the section (auto-creates section if it does not exist).
- `PUT /api/v1/:apiSlug/:sectionSlug/:id`: Updates an item.
- `DELETE /api/v1/:apiSlug/:sectionSlug/:id`: Deletes an item.

### Developer Direct Routes
- `ALL /skills`, `/api/skills`, `/api/v1/skills`: Direct developer endpoint to query or post skills.
- `GET /api/:sectionSlug`: Direct GET endpoint for any section (requires API key, JWT token, or `?apiSlug=` query param).

---

## 5. Security & Architectural Integrity

1. **Section Ownership Validation (Fixed)**: `PUT /api/v1/:apiSlug/sections/:id` checks `where: { id, userId: req.userId }` before allowing updates, preventing Insecure Direct Object References (IDOR).
2. **Cascading Deletions**: Deleting any section immediately cascades and deletes all related content items from PostgreSQL without leaving orphaned data.
3. **Data Isolation in Direct Routes**: Direct endpoints (`/api/:sectionSlug`) strictly validate credentials or require an explicit `?apiSlug=` query param. The previous fallback to the latest registered user has been removed.
4. **Native JSON Types**: Field definitions on `Section` and item attributes on `ContentItem` are stored as native PostgreSQL `Json`, ensuring data integrity and query efficiency.
5. **Foreign Key Indexing**: Indexes added on `[userId]`, `[sectionId]`, and `[userId, sectionId]` to eliminate sequential scans on large collections.

---

## 6. Changelog

- **2026-10-11 (Section Types: Normal vs Text Editor & Full-Page Drafting Canvas)**:
  - Added section type selection in the **Create New Section** modal:
    - **Normal Section (Structured Data)**: Ideal for custom structured schemas (projects, skills, services, testimonials) with standard modal popup data entry.
    - **Text Editor Section (Articles & Long-form)**: Ideal for blogs, articles, and case studies. Configures rich text schema, cover image, and full-page authoring.
  - Implemented `<ArticleEditorView />` full-page authoring workspace in `client/src/components/ArticleEditorView.tsx`:
    - Full-page authoring canvas replacing the popup modal.
    - Single featured/cover image uploader with local file input and image URL modal with live preview and removal.
    - Rich text formatting toolbar (Headings H1-H3, Bold, Italic, Underline, Strikethrough, Lists, Blockquotes, Code Blocks, Links, Dividers).
    - Live Markdown preview and side-by-side reading stats (word count, char count, estimated reading time).
    - Status management supporting **Draft** vs **Live** publishing with immediate edge API sync.
  - Updated `DashboardPage.tsx` routing: clicking "+ Add Item" or "Edit" on Text Editor sections opens the full-page editor; Normal sections retain modal entry.
- **2026-10-11 (Brand Identity & Wordmark Styling)**:
  - Added user's high-resolution `logo.png` (interlocking tech badge) to `client/public/logo.png` and configured it as the browser favicon in `index.html`.
  - Created reusable `<BrandLogo />` and `<BrandWordmark />` components in `client/src/components/BrandLogo.tsx`.
  - Matched exact visual typography specifications for `portfolioCMS`:
    - Sans-serif extrabold geometric styling (`Plus Jakarta Sans`).
    - Dotless `ı` with an absolute, perfectly positioned vibrant lime circular dot (`#B8F256`).
    - Uppercase `CMS` with a vibrant lime rounded horizontal pill accent (`#B8F256`) positioned beneath the letter `C`.
  - Replaced legacy text/placeholder icons with `<BrandLogo />` across `Navbar.tsx`, `DashboardPage.tsx` (sidebar header and rail), `AuthPage.tsx`, `Footer.tsx`, and `DashboardMockup.tsx`.
- **2026-10-11 (Brand Rename to portfolioCMS & Home Navigation)**:
  - Enabled home navigation (`onGoHome`) when clicking the brand lockup in the dashboard sidebar.
  - Rebranded the platform name from `PortfolioHQ` to `portfolioCMS` across all web pages, headers, footers, meta tags, and guides.
- **2026-10-11 (Unified Collection Refactoring)**:
  - Migrated database architecture from split tables (`Project`, `Post`) to universal headless CMS architecture (`Section` + `ContentItem`).
  - Safely migrated existing project and post records into `ContentItem` without data loss.
  - Converted `data` and `fields` columns in PostgreSQL to native `Json` types.
  - Converted `ApiKey.lastUsed` to nullable `DateTime`.
  - Added indexes on `userId` and `sectionId`.
  - Unified backend API router in `server/index.ts` so all collections use the universal `/api/v1/:apiSlug/:sectionSlug` handler.
  - Added single item GET route: `GET /api/v1/:apiSlug/:sectionSlug/:id`.
  - Fixed IDOR vulnerability on section update.
  - Updated client `DashboardPage.tsx` to dynamically sync all collections from database.
  - Added **Delete Section** action to the dashboard UI so users can delete any collection (including Projects or Posts).
  - Verified with `npm run lint` (`tsc --noEmit` passed with 0 errors).
- **2026-10-11 (Initial)**:
  - Created initial `context.md` with complete technical architecture audit.
