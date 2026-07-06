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
12. After coding finishes, stop and tell the user to run `/review-module <module name>`.

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

* Only the selected module is built.
* shadcn/ui components are used first; custom components only when really needed.
* Bruno specs must be updated if API usage changes.
* Do not continue to review if the module is incomplete.

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
* Next command to run
* Remaining TODOs
