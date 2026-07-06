# Ship Frontend Module Workflow

Input:

* Module name: $ARGUMENTS

Workflow:

1. Assume the module has already been implemented with `/build-module <module name>` and reviewed with `/review-module <module name>`, and all quality gates have passed.
2. Run `git status` before any release action.
3. Confirm only related files are included in the commit. Do not include unrelated changes.
4. Use `git` only for local commit and push.
5. Use `gh` for all GitHub operations.
6. Commit the related changes using the required commit message format.
7. Push the current branch using the required push command.
8. Create or update the pull request.
9. Get and share the pull request link.

Quality Gates:

* Do not commit if lint, typecheck, test, or build failed.
* Do not commit if code review or QA found blocking issues.
* Do not commit unrelated files.
* Do not create or update a pull request if commit or push failed.

Git:

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
* Do not ask confirmation before creating or updating the pull request.
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
* Commit hash
* Branch name
* Pull request link
* Shipping result
* Remaining TODOs