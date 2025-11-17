# Proposal: Add End-to-End Testing Infrastructure

## Summary

Add comprehensive end-to-end (E2E) testing infrastructure to the API using Jest, Supertest, and @nestjs/testing following NestJS best practices. This includes setting up a separate test database (`vsgkugelberg_test`), configuring Jest for E2E tests, and creating E2E test suites for all controller endpoints.

## Context

The API currently has no E2E tests, making it difficult to verify that:
- All endpoints work correctly end-to-end
- Authentication and authorization guards function properly
- Database operations complete successfully
- DTOs and validation pipes work as expected
- Error handling behaves correctly

The project uses:
- NestJS 11.x with Express
- Prisma ORM with PostgreSQL
- JWT-based authentication with HTTP-only cookies
- Multiple controllers: auth, users, posts, categories, tags, departments, health

## Problem Statement

Without E2E tests, we cannot:
1. Verify complete request-response flows through the entire stack
2. Test authentication/authorization in realistic scenarios
3. Validate database interactions without mocking
4. Ensure API contracts remain stable across refactors
5. Catch integration issues before production

## Proposed Solution

Implement a complete E2E testing infrastructure that:

1. **Test Database Setup**: Use a dedicated `vsgkugelberg_test` PostgreSQL database
2. **Jest Configuration**: Add Jest with ts-jest transformer and E2E-specific settings
3. **Test Helpers**: Create utilities for authentication, database seeding, and cleanup
4. **Controller Tests**: Write E2E tests for all seven controllers
5. **CI Integration**: Ensure tests run in GitHub Actions pipeline

### Test Organization

```
apps/api/test/
├── e2e/
│   ├── auth.e2e-spec.ts          # Login endpoint
│   ├── users.e2e-spec.ts         # User CRUD operations
│   ├── posts.e2e-spec.ts         # Post CRUD + filtering
│   ├── categories.e2e-spec.ts    # Category CRUD
│   ├── tags.e2e-spec.ts          # Tag CRUD
│   ├── departments.e2e-spec.ts   # Department CRUD
│   └── health.e2e-spec.ts        # Health check
├── fixtures/
│   └── test-data.ts              # Seed data for tests
└── helpers/
    ├── setup-test-db.ts          # Database initialization
    ├── auth-helper.ts            # Authentication utilities
    └── cleanup.ts                # Test cleanup utilities
```

## Benefits

- **Confidence**: Verify complete system behavior
- **Regression Prevention**: Catch breaking changes early
- **Documentation**: Tests serve as living API documentation
- **Standards Compliance**: Follow NestJS testing conventions
- **CI/CD Ready**: Automated testing in pipelines

## Trade-offs

**Pros:**
- High confidence in API behavior
- Realistic test scenarios with real database
- Easy to maintain with clear test structure
- Follows NestJS ecosystem standards

**Cons:**
- Slower than unit tests (requires database operations)
- Additional test database setup complexity
- Requires database state management between tests

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Test database conflicts | Use isolated `vsgkugelberg_test` database with cleanup between tests |
| Slow test execution | Use `beforeAll` for app initialization, parallel test execution where possible |
| Flaky tests | Implement proper cleanup, use transactions, reset database state |
| Environment setup complexity | Document setup clearly, provide helper scripts |

## Implementation Plan

See `tasks.md` for detailed implementation steps.

## Open Questions

1. Should we use database transactions that rollback after each test, or full database cleanup?
   - **Recommendation**: Full database cleanup with `prisma migrate reset` for simplicity
2. Should E2E tests run in parallel or sequentially?
   - **Recommendation**: Sequential with `--runInBand` to avoid database conflicts
3. Should we mock external services?
   - **Recommendation**: No external services currently, but mock if added later

## Success Criteria

- [ ] Jest E2E configuration is working
- [ ] Test database setup is documented and automated
- [ ] All 7 controllers have E2E test coverage
- [ ] Authentication flows are tested end-to-end
- [ ] Tests pass in local development and CI
- [ ] Test execution time is under 30 seconds for full suite

## Related Changes

- This creates the new `api-testing` capability
- Enhances existing capabilities: authentication-api, user-api, post-api, category-api, tag-api, department-api, health-check

## References

- [NestJS E2E Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
