# Proposal: Add GitHub Actions CI for Lint and Format Checks

## Status
**Draft** - Awaiting review and approval

## Motivation
The VSG Kugelberg monorepo currently lacks automated CI/CD checks. Without continuous integration, code quality issues can slip into the main branch undetected:

1. **No automated quality gates** - Pull requests can be merged without verification that code passes linting and format checks
2. **Inconsistent code quality** - Developers may forget to run `pnpm lint` or `pnpm format` before committing
3. **Manual verification burden** - Reviewers must manually check that code passes all quality checks
4. **Delayed feedback** - Issues are discovered late, during code review or after merge, rather than immediately on push
5. **Risk of breaking builds** - Without CI, there's no guarantee that code builds successfully across all apps

GitHub Actions provides a native CI/CD solution that integrates seamlessly with GitHub repositories, offering automatic checks on every push and pull request.

## Goals
- Add GitHub Actions workflow to automatically lint all apps on push and pull request
- Add GitHub Actions workflow to automatically check code formatting on push and pull request
- Leverage Turborepo's caching to make CI runs fast and efficient
- Cache pnpm dependencies to speed up workflow execution
- Provide clear feedback when checks fail, showing which files have issues
- Run checks in parallel for maximum speed
- Ensure workflows work consistently across all branches

## Non-Goals
- Running tests (no testing framework configured yet - future work)
- Building artifacts for deployment (not needed yet)
- Running dev servers or end-to-end tests
- Publishing packages or creating releases
- Setting up branch protection rules (repository admin task)
- Adding badges to README (can be added later)

## Approach

### Workflow Structure
Create a single workflow file `.github/workflows/ci.yml` that:
- Triggers on `push` and `pull_request` events
- Runs lint and format checks as separate jobs (can run in parallel)
- Uses matrix strategy if needed for testing multiple Node versions (not required initially)

### Workflow Jobs

#### 1. Lint Job
- Checkout code using `actions/checkout@v5`
- Setup pnpm using `pnpm/action-setup@v4` with version from `packageManager` field
- Setup Node.js using `actions/setup-node@v4` with pnpm caching enabled
- Install dependencies with `pnpm install`
- Run `pnpm lint` to lint all apps via Turborepo

#### 2. Format Check Job
- Same setup as lint job (checkout, pnpm, node)
- Run `pnpm format` to check formatting across all apps via Turborepo

### Caching Strategy
- **pnpm dependencies**: Use `actions/setup-node@v4` with `cache: 'pnpm'` for automatic dependency caching
- **Turborepo cache**: Turborepo will use local caching within the workflow run (remote cache not configured yet)

### Node Version
Use Node.js `20.x` to match the project's constraint of `^20.19.0 || >=22.12.0`

### Best Practices
- Use pinned action versions with SHA or major version tags
- Set explicit pnpm version from `packageManager` field
- Run jobs in parallel for faster feedback
- Use descriptive job and step names
- Add comments explaining any non-obvious configurations

## Impact

### Developer Experience
- **Immediate feedback**: Developers know within minutes if their code passes checks
- **Confidence**: Can see all checks passing before requesting review
- **Consistency**: Same checks run for everyone, regardless of local setup
- **Clear errors**: GitHub Actions UI shows exactly which files have lint/format issues

### Code Quality
- **Prevention**: Bad code can't be merged without checks passing (with branch protection)
- **Standards**: Enforces coding standards automatically
- **Visibility**: Failed checks are visible in PR UI
- **Accountability**: Clear record of which commits broke checks

### CI Performance
- Initial runs: ~30-60 seconds (with dependency install)
- Cached runs: ~10-20 seconds (with pnpm cache)
- Turborepo local cache: May provide additional speedup within workflow

### Repository
- Creates `.github/workflows/` directory (currently excluded from git by `.gitignore`)
- **NOTE**: Need to adjust `.gitignore` to allow `.github/workflows/` while keeping other `.github/` content ignored

## Alternatives Considered

### Other CI/CD Platforms

#### GitLab CI
- **Pros**: Feature-rich, good for complex pipelines
- **Cons**: Requires GitLab, not native to GitHub, extra setup
- **Decision**: GitHub Actions is native and simpler for GitHub repositories

#### CircleCI
- **Pros**: Powerful, good caching, nice UI
- **Cons**: External service, requires account, costs money for private repos
- **Decision**: GitHub Actions is free for public repos and included with GitHub

#### Travis CI
- **Pros**: Mature, well-documented
- **Cons**: Less popular now, pricing changes, external service
- **Decision**: GitHub Actions is more modern and better integrated

#### Jenkins
- **Pros**: Highly customizable, self-hosted
- **Cons**: Requires infrastructure, complex setup, maintenance burden
- **Decision**: Overkill for this project's needs

### Different Workflow Structures

#### Single Job for All Checks
- **Pros**: Simpler workflow file, single queue time
- **Cons**: Sequential execution, slower feedback, less granular failure reporting
- **Decision**: Separate jobs are faster and provide better feedback

#### Separate Workflow Files
- **Pros**: Could separate lint.yml and format.yml
- **Cons**: Duplicate setup code, more files to maintain
- **Decision**: Single workflow with multiple jobs is cleaner

#### Matrix Strategy for Multiple Node Versions
- **Pros**: Tests compatibility across Node versions
- **Cons**: Slower (runs multiple times), not needed yet (only one version in use)
- **Decision**: Can add later if needed, YAGNI for now

## Dependencies
- Requires adjusting `.gitignore` to allow `.github/workflows/` directory
- Uses existing Turborepo setup (already configured)
- Uses existing lint and format scripts in package.json (already configured)
- Requires pnpm and Node.js (specified in package.json)

## Success Metrics
- ✅ Workflow file created and committed
- ✅ Workflow runs successfully on push
- ✅ Workflow runs successfully on pull requests
- ✅ Lint failures are detected and reported
- ✅ Format check failures are detected and reported
- ✅ Workflow completes in under 2 minutes with cold cache
- ✅ Workflow completes in under 30 seconds with warm cache
- ✅ Failed checks show clear error messages indicating what to fix

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Workflow file syntax errors | Low | Medium | Test workflow immediately after creation, validate YAML |
| Long CI run times | Low | Medium | Use caching, run jobs in parallel, monitor workflow duration |
| False positive failures | Low | High | Test workflow locally first, ensure lint/format rules match local |
| Cache issues causing inconsistent results | Low | Medium | Document cache clearing, use cache: 'pnpm' which is well-tested |
| .gitignore blocks workflow file | Medium | High | Update .gitignore before creating workflow |
| Workflow quota limits | Very Low | Low | Free tier is generous, monitor usage |

## Timeline
- **Workflow creation**: 30 minutes
- **Testing and verification**: 30 minutes
- **Documentation**: 15 minutes
- **Total**: ~1-1.5 hours

## Related Changes
- Complements the existing Turborepo setup (add-turborepo change)
- Builds on existing linting and formatting configuration (code-quality spec)
- Future: Could add type-check job
- Future: Could add build job to verify builds succeed
- Future: Could add test job when testing framework is added
- Future: Could add branch protection rules requiring checks to pass

## Implementation Notes
- Must update `.gitignore` to specifically allow `.github/workflows/**` while keeping the rest of `.github/` ignored
- Workflow will use pnpm version `10.22.0` specified in `packageManager` field
- Should add a comment in the workflow explaining the pnpm/action-setup is third-party
- Consider adding conditional logic to skip CI on docs-only changes (future optimization)
