# Review Frontend Module Workflow

Input:

* Module name: $ARGUMENTS

Workflow:

1. Assume the module has already been implemented with `/build-module <module name>`.
2. Use code-reviewer skill to review the module.
3. Fix blocking review issues before continuing.
4. Use senior-qa skill to add and run tests.
5. Fix QA issues before continuing.
6. Run lint, typecheck, test, and build.
7. If all gates pass, stop and tell the user to run `/ship-module <module name>`.

Quality Gates:

* Code review must pass.
* QA must pass.
* Lint must pass.
* Typecheck must pass.
* Tests must pass.
* Build must pass.
* Do not continue to shipping if any gate fails.

Final Output:

* Module reviewed
* Skills used
* Review result
* Blocking issues found and fixed
* Tests run
* Lint result
* Typecheck result
* Build result
* Next command to run
* Remaining TODOs
