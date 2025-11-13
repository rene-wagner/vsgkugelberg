# Implementation Tasks

## Overview
This document outlines the implementation tasks for adding GitHub Actions CI workflows to the VSG Kugelberg monorepo. Tasks should be completed in order, with each task tested and verified before moving to the next.

## Tasks

- [x] **Update .gitignore to allow workflow directory**
  - Read current `.gitignore` file at repository root
  - Add exception pattern to allow `.github/workflows/**` while keeping rest of `.github/` ignored
  - Add comment explaining why this exception exists
  - Verify the pattern works with `git check-ignore .github/workflows/ci.yml`
  - Commit the updated `.gitignore`

- [x] **Create .github/workflows directory**
  - Create `.github/workflows/` directory structure at repository root
  - Verify directory is tracked by git (not ignored)
  - Verify directory shows as untracked or ready to be added

- [x] **Create GitHub Actions CI workflow file**
  - Create `.github/workflows/ci.yml` file
  - Add workflow name: "CI"
  - Configure triggers:
    - `on: [push, pull_request]`
  - Add permissions if needed (typically read permissions are default)
  - Validate YAML syntax using a linter or online validator

- [x] **Add lint job to workflow**
  - Define job named `lint` that runs on `ubuntu-latest`
  - Add step to checkout code: `actions/checkout@v5`
  - Add step to setup pnpm: `pnpm/action-setup@v4` with version `10.22.0`
  - Add step to setup Node.js: `actions/setup-node@v4` with:
    - `node-version: '20'`
    - `cache: 'pnpm'`
  - Add step to install dependencies: `pnpm install`
  - Add step to run lint: `pnpm lint`
  - Add descriptive names to all steps
  - Add comment explaining pnpm/action-setup is third-party

- [x] **Add format check job to workflow**
  - Define job named `format-check` that runs on `ubuntu-latest`
  - Use same checkout, pnpm, and Node.js setup steps as lint job
  - Add step to install dependencies: `pnpm install`
  - Add step to run format check: `pnpm format`
  - Add descriptive names to all steps

- [x] **Test workflow locally (if possible)**
  - Install act tool for local GitHub Actions testing (optional)
  - Or review workflow syntax carefully against GitHub Actions documentation
  - Verify pnpm version matches `packageManager` field (10.22.0)
  - Verify Node.js version matches project constraint (20.x)
  - Check that all referenced actions exist and versions are valid

- [x] **Commit workflow file**
  - Add `.github/workflows/ci.yml` to git
  - Verify file is tracked (not ignored)
  - Write descriptive commit message
  - Commit the workflow file

- [x] **Push and verify workflow runs**
  - Push commit to GitHub
  - Navigate to repository's Actions tab
  - Verify workflow appears in the list
  - Verify workflow starts running automatically
  - Wait for workflow to complete

- [ ] **Verify lint job succeeds**
  - Check that lint job completed successfully
  - Review workflow logs to confirm:
    - Correct pnpm version was installed
    - Correct Node.js version was set up
    - Dependencies were installed (check for cache hit on subsequent runs)
    - `pnpm lint` command ran
    - Turborepo executed lint task across packages
    - No linting errors were found
    - Job status shows green checkmark

- [ ] **Verify format check job succeeds**
  - Check that format-check job completed successfully
  - Review workflow logs to confirm:
    - Setup steps completed correctly
    - `pnpm format` command ran
    - Turborepo executed format check across packages
    - No formatting issues were found
    - Job status shows green checkmark

- [ ] **Test workflow failure detection**
  - Introduce a deliberate lint error in a file (e.g., add unused variable)
  - Commit and push the change
  - Verify workflow runs and lint job fails
  - Check that error message is clear and actionable
  - Revert the change to restore passing state

- [ ] **Test format check failure detection**
  - Introduce a deliberate format issue (e.g., add extra spaces)
  - Commit and push the change
  - Verify workflow runs and format-check job fails
  - Check that error message indicates which files need formatting
  - Revert the change to restore passing state

- [ ] **Verify caching is working**
  - Trigger workflow again without changing dependencies
  - Check workflow logs for pnpm cache hit message
  - Verify dependency installation completes much faster (under 10s)
  - Note the overall workflow duration

- [ ] **Verify parallel job execution**
  - Observe that lint and format-check jobs start at the same time
  - Confirm they run independently (one failing doesn't block the other)
  - Verify both jobs show individual status indicators

- [ ] **Update project documentation**
  - Add CI/CD section to `openspec/project.md` if appropriate
  - Document that workflows run on push and pull requests
  - Explain how to view workflow results
  - Note that failed checks must be fixed before merging (if branch protection is enabled)

- [ ] **Final validation**
  - Create a test pull request with clean code
  - Verify all checks pass and show green in PR UI
  - Verify workflow duration is reasonable (< 2 min cold, < 30s warm)
  - Verify error messages are helpful when introducing deliberate failures
  - Confirm workflow files are properly committed and tracked

- [ ] **Create commit with documentation updates**
  - Stage any documentation changes
  - Write descriptive commit message
  - Commit and push

## Dependencies
- Requires `.gitignore` to be updated before workflow files can be committed
- Requires existing Turborepo setup (already in place)
- Requires existing lint and format scripts (already configured)
- Jobs should run in parallel, not sequentially

## Validation Criteria
- ✅ `.github/workflows/ci.yml` file exists and is tracked by git
- ✅ Workflow triggers automatically on push
- ✅ Workflow triggers automatically on pull requests
- ✅ Lint job runs successfully with clean code
- ✅ Format check job runs successfully with clean code
- ✅ Failed checks are detected and reported clearly
- ✅ pnpm dependencies are cached between runs
- ✅ Jobs run in parallel
- ✅ Workflow completes in under 2 minutes with cold cache
- ✅ Workflow completes in under 30 seconds with warm cache

## Notes
- The `.github/` directory is currently in `.gitignore` and must be adjusted
- Workflow uses `pnpm/action-setup` which is third-party (not GitHub-certified)
- pnpm must be set up before Node.js for caching to work properly
- Turborepo's local caching will work within each workflow run
- Consider adding branch protection rules after validating workflows work
