# Kidsroad Project Rules

This file provides guidance to Cursor AI when working with code in this repository.

## Project Overview

**Kidsroad (키즈로드)** is a mobile-first web service that helps parents find age-appropriate festivals and events for their children. The platform aggregates scattered information from public APIs and provides curated, parent-focused filtering (age ranges, stroller access, parking, indoor/outdoor, etc.).

**Slogan**: "아이와 함께하는 모든 순간, 키즈로드가 안내합니다" (Kidsroad guides every moment with your child)

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript 5
- **Deployment**: Vercel
- **Database**: Supabase (PostgreSQL) - to be integrated
- **Data Sources**: TourAPI (한국관광공사), 문화포털 API (문화체육관광부)

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow Next.js 16 App Router conventions
- Use path alias `@/` for imports from project root
- UI text: Korean, Technical code: English
- Use Prettier for code formatting (configured in `.prettierrc`)
- Follow ESLint rules (configured in `eslint.config.mjs`)

### Coding Best Practices (1인 개발 필수)

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
- Mark TODOs with context: `// TODO: [context] 설명`

#### Security
- Never commit API keys or secrets - use environment variables
- Validate and sanitize user inputs
- Use parameterized queries for database operations (when Supabase integrated)
- Implement proper CORS policies
- Sanitize data before rendering to prevent XSS

### Git Workflow

- **Current Strategy**: `main` + `dev` (Phase 1)
- Work on `dev` branch, merge to `main` for deployment
- **Commit format**: `<type>: <description>`
  - Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`
  - Example: `feat: 연령별 필터 기능 추가`

### UI/UX Principles

- **Mobile-first**: Design for mobile, enhance for desktop
- **Quick scanning**: Use clear tags, icons, and concise information
- **Parent-focused**: Highlight practical info (parking, stroller access, etc.)
- **Fast decisions**: Enable filtering to relevant options in 2-3 clicks

### Project Structure

- `app/` - Next.js App Router directory
- `components/` - UI components
- `lib/` - Utility functions
- `types/` - TypeScript type definitions
- `hooks/` - Custom React hooks
- `docs/` - Project documentation

### Key Features (from PRD)

1. **Age-based Filtering**: 0-2세 / 3-5세 / 6-9세 / 10세+
2. **Parent Checklist Filters**: 유모차, 주차, 실내/실외, 무료, 수유실, 기저귀 교환대
3. **Integrated Event Data**: Public APIs + web scraping
4. **Curated Lists**: Weekend recommendations, weather-based, free events
5. **Event Detail Pages**: All essential information in one place

### Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Quality Checklist (Before Committing)

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] No console.log statements in production code (use proper logging)
- [ ] Error handling is implemented
- [ ] Loading and error states are handled in UI
- [ ] Mobile responsiveness is tested
- [ ] No hardcoded values (use constants or config)

### Naming Conventions

- **Components**: PascalCase (`EventCard.tsx`, `FilterButton.tsx`)
- **Functions/Variables**: camelCase (`getEventList`, `userAge`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_EVENTS_PER_PAGE`)
- **Types/Interfaces**: PascalCase (`EventData`, `UserPreferences`)
- **Files**: 
  - Components: PascalCase (`EventCard.tsx`)
  - Utilities: camelCase (`formatDate.ts`)
  - Types: camelCase with `.types.ts` suffix (`event.types.ts`)

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

### Documentation References

- Full product vision: `docs/PRD.md`
- Development roadmap: `docs/ROADMAP.md`
- Git workflow: `docs/git_branch_guide.md`

