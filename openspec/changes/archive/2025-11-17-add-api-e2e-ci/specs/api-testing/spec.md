## ADDED Requirements
### Requirement: API E2E Tests Run in CI
The GitHub Actions pipeline SHALL execute the API end-to-end test suite against a disposable Postgres database on every push and pull request to `main`.

#### Scenario: Workflow provisions Postgres service
- **GIVEN** `.github/workflows/ci.yml` defines repository automation
- **WHEN** the workflow runs for a push or pull request
- **THEN** it SHALL include a dedicated job (e.g., `api-e2e`) for the API tests
- **AND** that job SHALL start a Postgres 16 (or later) service container with `POSTGRES_DB=vsgkugelberg_test`, `POSTGRES_USER=user`, and `POSTGRES_PASSWORD=secret`
- **AND** it SHALL export `DATABASE_URL=postgresql://user:secret@localhost:5432/vsgkugelberg_test` (matching `apps/api/.env.test`) to all steps in the job

#### Scenario: Workflow applies schema and runs tests
- **GIVEN** the `api-e2e` job is executing
- **WHEN** dependencies have been installed via pnpm
- **THEN** the job SHALL run Prisma migrations against the CI database (e.g., `pnpm --filter api prisma migrate deploy`) before executing tests
- **AND** it SHALL run `pnpm --filter api test:e2e`
- **AND** the workflow SHALL fail if migrations or the Jest E2E suite fails so regressions cannot merge
