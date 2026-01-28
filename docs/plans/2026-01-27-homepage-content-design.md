# Homepage Content Configuration Design

## Context

Homepage copy is currently hard-coded in `HeroSection`, `StatsSection`, `DepartmentsSection`, `NewsSection`, and `CtaSection`. The backend already follows a singleton pattern for content (`ClubSettings`, `HistoryContent`) and uses ordered stat relations (`DepartmentStat`). We need database-backed homepage content so text changes no longer require a deployment.

## Goals

- Store homepage hero, departments, posts, and CTA copy in the database.
- Maintain an ordered list of homepage stats.
- Expose a public read API and an admin update API.
- Seed initial content so the homepage renders with existing copy.
- Use `postsCount` to control how many news items load.

## Non-Goals

- Redesigning the homepage layout or styling.
- Adding localization, versioning, or experimentation.
- Building a dedicated admin UI in this change.

## Decisions

- Use a singleton `HomepageContent` model with `id @default(1)`.
- Use a separate `HomepageStat` model with a one-to-many relation and `sort` ordering.
- Provide `GET /api/homepage-content` for public reads and `PATCH /api/homepage-content` for admin updates.
- Seed the singleton record and initial stats during migration; use upsert to self-heal if missing.
- Keep existing copy as a fallback while data loads or on API errors.

## Risks and Trade-offs

- Singleton approach limits future variants -> can extend to multiple records later if needed.
- No admin UI could slow updates -> mitigate with API access and later UI work.
- Seed data drift between code and DB -> treat DB as source of truth after migration.

## Migration Plan

- Add Prisma models and create a migration.
- Seed the initial content and stats from current copy.
- Verify `GET /api/homepage-content` returns ordered stats.

## Open Questions

- Should any fields allow rich text/HTML, or remain plain strings?
- Should admin editing UI be part of this change or follow later?
