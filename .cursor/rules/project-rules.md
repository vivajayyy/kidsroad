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

### Documentation References

- Full product vision: `docs/PRD.md`
- Development roadmap: `docs/ROADMAP.md`
- Git workflow: `docs/git_branch_guide.md`

