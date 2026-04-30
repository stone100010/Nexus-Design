# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-12-17

### Added
- Complete TypeScript type system (eliminated all `any` types)
- Global error boundaries (page, root, 404, loading states)
- Unified API error handling with `ApiError` utility
- Toast notification system for user feedback
- Save status indicator in editor toolbar
- AI generation error messages (401/429/500 handling)
- Auth form inline validation with field-level errors
- Editor empty state with AI generation shortcut
- Workspace empty state with guided CTA
- Global navigation bar component
- Workspace project list from database
- Project CRUD API (`/api/projects/[id]`)
- Project search and sort functionality
- Component library with search and mobile components
- Properties panel: fontWeight, border, boxShadow, opacity editing
- Canvas: boundary detection, grid snapping, mouse wheel zoom
- Code export: preview modal, copy to clipboard
- Project settings page (`/design/settings`)
- User settings page (`/settings`)
- User profile and password API endpoints
- Version management API (`/api/projects/[id]/versions`)
- Rate limiting middleware
- Unit tests for utils (34 tests) and stores (21+ tests)
- Component tests for Button and Card
- E2E test stubs (Playwright)
- Dockerfile (multi-stage production build)
- docker-compose.yml (app + postgres + redis)
- GitHub Actions CI workflow
- Pricing section on homepage
- FAQ section on homepage
- Footer with navigation links
- `tailwindcss-animate` for smooth animations

### Fixed
- Next.js 16 → 14 downgrade for NextAuth 4.x compatibility
- Button `asChild` prop using `<span>` instead of React.Fragment
- TypeScript `jsx` setting in tsconfig.json
- `serverExternalPackages` config for Next.js 14
- AI page missing imports and path aliases
- Workspace page Metadata conflict in client component
- Login/Register `'use client'` directive position
- Provider duplication across pages (centralized in layout)

### Changed
- All `any` types replaced with proper TypeScript interfaces
- Console.error replaced with toast notifications
- API routes refactored to use `handleApiError`
- Editor canvas enhanced with boundary detection and grid snapping
- Component library reorganized with categories and search
- Properties panel expanded with more style controls
- Workspace page now fetches real projects from API
