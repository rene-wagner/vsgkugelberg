## 1. Implementation
- [x] 1.1 Extend `.github/workflows/ci.yml` with an `api-e2e` job that runs on every push and pull request (same triggers as lint/format) and waits for those jobs via `needs` so failures gate merges.
- [x] 1.2 Within the `api-e2e` job, provision a `postgres:16` service that exposes `5432`, sets `POSTGRES_DB=vsgkugelberg_test`, `POSTGRES_USER=user`, and `POSTGRES_PASSWORD=secret`, and exports `DATABASE_URL=postgresql://user:secret@localhost:5432/vsgkugelberg_test` to subsequent steps.
- [x] 1.3 Reuse the existing pnpm + Node setup (checkout, pnpm/action-setup@v4, actions/setup-node@v4 with pnpm caching, `pnpm install`).
- [x] 1.4 After installing dependencies, run `pnpm --filter api prisma migrate deploy` against the CI database to ensure the schema matches what the tests expect.
- [x] 1.5 Execute `pnpm --filter api test:e2e` so GitHub Actions blocks on the NestJS E2E suite.

## 2. Validation
- [x] 2.1 Run `pnpm --filter api test:e2e` locally with `apps/api/.env.test` to make sure the suite still passes after any workflow-related adjustments (e.g., migrations, seed changes).
- [ ] 2.2 Open a pull request or push to a test branch and confirm the `api-e2e` job succeeds alongside lint/format before requesting review.
