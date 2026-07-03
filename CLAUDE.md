# CLAUDE.md

## Project

Room Rental Management SaaS frontend.

Build the app module by module. Do not build unrelated features.

## Stack

* Next.js
* TypeScript
* shadcn/ui
* Tailwind CSS
* Valibot
* Zustand
* TanStack Query
* TanStack Table
* Bruno API specs in `../boarding-house-api/bruno`

## Required Docs

Always read these before coding:

* /docs/product-requirements.md
* /docs/business-rules.md
* /docs/api-spec.md
* /docs/ui-pages.md
* /docs/user-flows.md
* /docs/coding-rules.md
* relevant /docs/modules/*.md file

## Coding Rules

* Follow the API spec exactly.
* Build only the selected module.
* Do not change unrelated files.
* Do not hardcode fake data unless clearly temporary.
* Keep page files simple.
* Use shadcn/ui components first.
* Do not create new custom components unless really needed.
* Do not create wrapper components if direct shadcn/ui usage is enough.
* Create a new component only when it is reused, complex, or makes the page easier to maintain.
* Put API calls in services/hooks.
* Use TanStack Query for server state.
* Use Zustand only for shared client state.
* Use Valibot for form validation.
* Use Tailwind for layout and spacing.
* Use TanStack Table for list pages.
* Add loading, empty, error, and success states.
* Disable buttons while submitting.
* Show clear validation and API error messages.
* Format money as IDR.
* Make UI readable for elderly users with bigger text and comfortable spacing.

## Bruno Rules

* Bruno API specs are stored in `../boarding-house-api/bruno`.
* Update `../boarding-house-api/bruno` when frontend adds or changes API usage.
* Bruno requests must match `/docs/api-spec.md`.
* Include auth headers, request body, query params, and sample responses.
* Do not commit frontend API integration changes without updating Bruno when needed.

## Frontend Business Rules

* Owner pages must only show owner data from API.
* Tenant pages must only show tenant portal data from API.
* Do not send `owner_id` from frontend.
* Pay Now must be disabled if bill is paid or cancelled.
* Prevent double submit when creating payment links.
* Do not mark payment as paid from frontend redirect.
* Show gateway pending status until backend confirms payment.

## Security Rules
- Do not store secrets in frontend.
- Do not expose payment gateway secret keys.
- Do not mark payment as paid from redirect page.
- Payment result page should show “waiting for confirmation” unless backend confirms paid.

## Commands

Use the project package manager.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```