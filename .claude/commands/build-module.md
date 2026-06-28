# Build Frontend Module Workflow

Input:

* Module name: $ARGUMENTS

Workflow:

1. Read required docs first.
2. Use senior-frontend skill to implement only the selected module.
3. Build required pages, forms, tables, hooks, and API integration.
4. Use Next.js, shadcn/ui, Tailwind, Valibot, Zustand, TanStack Query, and TanStack Table.
5. Use shadcn/ui components first.
6. Do not create new custom components unless really needed.
7. Use Valibot for all form validation.
8. Use TanStack Query for API/server state.
9. Use Zustand only for shared client state if needed.
10. Add loading, empty, error, success, and disabled submit states.
11. Create or update Bruno API specs in `../boarding-house-api/bruno` if frontend needs new or changed API contracts.
12. After coding finishes, use code-reviewer skill to review.
13. Fix blocking review issues before continuing.
14. Use senior-qa skill to add and run tests.
15. Fix QA issues before continuing.
16. Run lint, typecheck, test, and build.
17. Commit only if all gates pass.
18. Push current branch.
19. Create or update pull request.
20. Share pull request link.

Required docs:

* /docs/product-requirements.md
* /docs/business-rules.md
* /docs/api-spec.md
* /docs/ui-pages.md
* /docs/user-flows.md
* /docs/coding-rules.md
* relevant /docs/modules/*.md file

Bruno API Specs:

* Bruno specs are stored in `../boarding-house-api/bruno`.
* Update Bruno when frontend adds or changes API usage.
* Bruno specs must follow `/docs/api-spec.md`.
* Include auth headers, request body, query params, and sample responses.

Quality Gates:

* Code review must pass.
* QA must pass.
* Lint must pass.
* Typecheck must pass.
* Tests must pass.
* Build must pass.
* Bruno specs must be updated if API usage changes.
* Do not commit if any gate fails.
* Do not create PR if any gate fails.

Git:

* Use `git` only for local commit and push.
* Use `gh` for all GitHub operations.
* Run `git status` before commit.
* Commit only related files.
* Commit message format:

```text
feat(<module>): implement <module name> frontend
```

* Push command:

```bash
git push -u origin HEAD
```

Pull Request:

* Running this workflow means push and PR are already approved.
* Do not ask confirmation before creating PR.
* Create PR using:

```bash
gh pr create --base main --head <current-branch> --title "<title>" --body "<body>"
```

* If PR already exists, update it:

```bash
gh pr edit <number-or-branch> --title ... --body ...
```

* PR title format:

```text
feat(<module>): implement <module name> frontend
```

* PR body must include:

  * module built
  * summary of changes
  * pages/routes implemented
  * shadcn/ui components used
  * custom components created, if any, and why
  * forms and validation added
  * API hooks added
  * Bruno API specs updated
  * tests run
  * review result

* Get PR URL:

```bash
gh pr view --json url -q .url
```

* If `gh` is not authenticated, stop and report `gh auth login` is required.

Final Output:

* Module built
* Skills used
* Pages/routes implemented
* shadcn/ui components used
* Custom components created, if any
* Forms added/updated
* API hooks added/updated
* Zustand stores added/updated
* Bruno specs updated
* Tests run
* Lint result
* Typecheck result
* Build result
* Review result
* Commit hash
* Branch name
* Pull request link
* Remaining TODOs
