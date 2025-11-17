# Change: Add API E2E CI Job

## Why
The NestJS API already exposes full end-to-end coverage locally, but regressions can reach `main` because the suite never runs automatically in CI. We need a gated pipeline that exercises the API against a real Postgres instance before merges.

## What Changes
- Extend `.github/workflows/ci.yml` with an `api-e2e` job that runs on every push and pull request alongside lint/format checks.
- Provision a Postgres 16 service that mirrors the credentials in `apps/api/.env.test` so tests talk to a dedicated `vsgkugelberg_test` database.
- Run Prisma migrations against the CI database before executing `pnpm --filter api test:e2e` so the schema matches production expectations.
- Ensure pnpm + Node setup/caching is consistent with the other jobs so the suite stays within CI time budgets.

## Impact
- Affected specs: `api-testing`
- Affected code: `.github/workflows/ci.yml`, `apps/api/.env.test` (referenced for CI secrets)