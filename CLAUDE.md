# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kidsroad (키즈로드)** is a mobile-first web service that helps parents find age-appropriate festivals and events for their children. The platform aggregates scattered information from public APIs and provides curated, parent-focused filtering (age ranges, stroller access, parking, indoor/outdoor, etc.).

**Slogan**: "아이와 함께하는 모든 순간, 키즈로드가 안내합니다" (Kidsroad guides every moment with your child)

## Common Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Build & Deploy
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript 5
- **Deployment**: Vercel
- **Database**: Supabase (PostgreSQL) - to be integrated
- **Data Sources**:
  - TourAPI (한국관광공사)
  - 문화포털 API (문화체육관광부)
  - Web scraping for regional event data

## Project Structure

This is a Next.js 16 project using the App Router pattern:

- **`app/`** - Next.js App Router directory
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global styles
- **`components/`** - UI components
- **`lib/`** - Utility functions
- **`types/`** - TypeScript type definitions
- **`hooks/`** - Custom React hooks
- **`docs/`** - Project documentation
  - `PRD.md` - Complete Product Requirements Document
  - `ROADMAP.md` - 8-week development roadmap
  - `git_branch_guide.md` - Git workflow strategy
  - `TODO.md` - Current week's tasks only (past weeks → `archive/`)
  - `WORKLOG.md` - Work history (reverse chronological order)
  - `project_checklist.md` - Task tracking
- **`public/`** - Static assets
- **Path alias**: `@/*` maps to project root

## Architecture & Core Concepts

### Development Phases

**Current Phase**: Week 1 - Environment Setup

The project follows an 8-week MVP roadmap:

- **Weeks 1-4**: Foundation (setup, DB, data pipeline, core UI)
- **Weeks 5-8**: Features & launch (search/filters, map integration, QA, deployment)

### Git Workflow Strategy

**Current Strategy**: `main` + `dev` (Phase 1)

- `dev` - All development happens here (default branch)
- `main` - Production-ready code only, triggers Vercel deployment

**Commit Message Format**: `<type>: <description>`
- **Language**: **MUST be written in Korean ONLY** (커밋 메시지는 반드시 한글로 작성)
- **Types**: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`
- **Example**: `feat: 연령별 필터 기능 추가`
- **Commit Granularity**: Group changes into meaningful atomic commits (의미 있는 기능 단위로 묶어서 커밋)

**AI Commit Proposal Process**:
- **Case A (Safe Changes)**: Documentation (`docs`), simple config (`chore`)
  → Commit to `dev` then propose immediate merge to `main`
- **Case B (Feature Dev)**: Features (`feat`), Fixes (`fix`), Refactor (`refactor`)
  → Commit to `dev` and recommend testing before merge

**Workflow**:

```bash
# 1. Work on dev branch
git checkout dev
git pull origin dev

# 2. Develop and commit
git add .
git commit -m "feat: 검색 필터 추가"
git push origin dev

# 3. Merge to main when ready for deployment
git checkout main
git merge dev
git push origin main
```

### Core Features (from PRD)

1. **Age-based Filtering**: 0-2세 / 3-5세 / 6-9세 / 10세+
2. **Parent Checklist Filters**: 유모차, 주차, 실내/실외, 무료, 수유실, 기저귀 교환대
3. **Integrated Event Data**: Public APIs + web scraping
4. **Curated Lists**: Weekend recommendations, weather-based, free events
5. **Event Detail Pages**: All essential information in one place

### Target Users

- **Primary**: Working parents (30-40s) with young children
- **Pain Point**: Spend 30+ minutes searching fragmented information across blogs, maps, official sites
- **Solution**: Find suitable events in under 5 minutes with confidence

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow Next.js 16 App Router conventions
- Use path alias `@/` for imports from project root
- UI text: Korean, Technical code: English
- Use Prettier for code formatting (configured in `.prettierrc`)
- Follow ESLint rules (configured in `eslint.config.mjs`)

### Coding Best Practices

#### TypeScript & Type Safety
- Always define explicit types for function parameters and return values
- Use `interface` for object shapes, `type` for unions/intersections
- Avoid `any` type - use `unknown` if type is truly unknown, then narrow it
- Use type guards for runtime type checking
- Prefer `const` assertions for literal types

#### Error Handling
- Always handle errors explicitly - never use empty catch blocks
- Use try-catch for async operations
- Provide meaningful error messages in Korean for user-facing errors
- Log errors with context for debugging: `console.error('Error context:', error)`
- Use error boundaries for React components

#### Component Design
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use Server Components by default, Client Components only when needed (`'use client'`)
- Memoize expensive computations with `useMemo` and callbacks with `useCallback`
- Prefer composition over prop drilling - use Context API for deep nesting

#### Performance
- Use Next.js Image component for all images
- Implement proper loading states and error boundaries
- Lazy load heavy components with `dynamic()` import
- Optimize bundle size - check with `npm run build` before deployment
- Use React Server Components to reduce client-side JavaScript

#### Code Organization
- One component per file, named exports preferred
- Group related files in feature folders when appropriate
- Keep utility functions pure (no side effects)
- Extract constants to separate files (`lib/constants.ts`)

#### Comments & Documentation
- Write self-documenting code - prefer clear naming over comments
- Add JSDoc comments for public APIs and complex logic
- Explain "why" not "what" in comments
- Use Korean comments for business logic, English for technical details
- Mark TODOs with context: `// TODO: [context] description`

#### Security
- Never commit API keys or secrets - use environment variables
- Validate and sanitize user inputs
- Use parameterized queries for database operations (when Supabase integrated)
- Implement proper CORS policies
- Sanitize data before rendering to prevent XSS

### Data Pipeline (Week 3 milestone)

When implementing data collection:

- Use TourAPI and 문화포털 API as primary sources
- Apply rule-based classification for missing metadata
- Tag events with age ranges and parent checklist attributes
- Set up automated data refresh (cronjob)

### UI/UX Principles

- **Mobile-first**: Design for mobile, enhance for desktop
- **Quick scanning**: Use clear tags, icons, and concise information
- **Parent-focused**: Highlight practical info (parking, stroller access, etc.)
- **Fast decisions**: Enable filtering to relevant options in 2-3 clicks

### Naming Conventions

The codebase uses Korean for user-facing content and domain concepts. Maintain this pattern:

- **Components**: PascalCase (`EventCard.tsx`, `FilterButton.tsx`)
- **Functions/Variables**: camelCase (`getEventList`, `userAge`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_EVENTS_PER_PAGE`)
- **Types/Interfaces**: PascalCase (`EventData`, `UserPreferences`)
- **Files**:
  - Components: PascalCase (`EventCard.tsx`)
  - Utilities: camelCase (`formatDate.ts`)
  - Types: camelCase with `.types.ts` suffix (`event.types.ts`)
- **UI text**: Korean
- **Technical code**: English
- **Comments**: Korean for business logic, English for technical details

### TypeScript Configuration

- **Strict mode enabled**: All type checking enforced
- **Path alias**: Use `@/` for imports from project root
- **JSX**: Uses new `react-jsx` transform (React 19)
- **Target**: ES2017 for broad browser compatibility

### React/Next.js Specific Rules

- Use Server Components by default (no `'use client'` unless needed)
- Client Components only for: interactivity, browser APIs, hooks
- Use `async/await` in Server Components for data fetching
- Prefer `fetch` with Next.js caching over external libraries
- Use `generateMetadata` for SEO in page components
- Implement proper loading.tsx and error.tsx files

### API & Data Fetching

- Always handle loading, error, and success states
- Use Next.js built-in fetch caching strategies
- Implement proper error boundaries
- Validate API responses with TypeScript types
- Use Zod or similar for runtime validation when needed

### Code Quality Checklist (Before Committing)

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] No console.log statements in production code (use proper logging)
- [ ] Error handling is implemented
- [ ] Loading and error states are handled in UI
- [ ] Mobile responsiveness is tested
- [ ] No hardcoded values (use constants or config)

## Future Integration Notes

### Supabase Integration (Week 2 milestone)

When setting up the database:

- Tables needed: `events`, `event_categories`, `user_favorites` (Phase 2)
- Use Supabase Auth for user features (Phase 2)
- Enable Row Level Security (RLS) policies

### API Routes Pattern

Create API routes in `app/api/` directory following App Router conventions:

- `app/api/events/route.ts` - Event listing/search
- `app/api/events/[id]/route.ts` - Event details
- Use Next.js 16 Server Components where possible

### Environment Variables

When APIs are integrated, use `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TOUR_API_KEY=
NAVER_MAP_CLIENT_ID=
```

## Testing Strategy (Week 7 milestone)

- Manual QA focused for MVP
- Test key user journeys: search → filter → detail view
- Cross-browser testing: Chrome, Safari (mobile), Samsung Internet
- Performance: Lighthouse score target 90+

## Deployment

- **Platform**: Vercel
- **Branch**: `main` branch auto-deploys to production
- **Environment**: Node.js (configured in Vercel)
- **Static Assets**: Next.js Image Optimization enabled

## Documentation Management

**Always-on Files** - Keep these updated automatically during tasks:

- **`docs/TODO.md`**: Manage **Current Week's** tasks only. Move past weeks to `docs/archive/`
- **`docs/WORKLOG.md`**: Log work history in **reverse chronological order (newest top)**
  - Format: Date Header (`## YYYY-MM-DD`) → Category → Details
- **`docs/ROADMAP.md`**: Manage overall schedule and milestones

## Communication & Task Management

**Task-based Guidance**: Provide a **complete, end-to-end guide** for a specific task (e.g., a "TODO" item). Do not fragment instructions into button clicks; enable the user to complete the full task in one go.
- 클릭 단위가 아닌, "기능/Task 완성" 단위로 전체 가이드를 제공하세요
- 한 번에 하나씩, 명확한 단계별 가이드를 제공하세요

## Key Documentation References

- Full product vision and user personas: `docs/PRD.md`
- Week-by-week development plan: `docs/ROADMAP.md`
- Git branching strategy details: `docs/git_branch_guide.md`
- Coding best practices: `.agent/rules/kidsroad.md`

## Success Metrics (3-month MVP goal)

- 1,000 MAU (Monthly Active Users)
- 20% return rate within 7 days
- Average session time: 2+ minutes
- 500+ events in database
- Primary traffic source: organic search (SEO)
