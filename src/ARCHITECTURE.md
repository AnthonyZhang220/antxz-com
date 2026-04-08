# Project Structure Conventions

This project follows App Router, but keeps feature logic out of route folders when possible.

## Route Files

- `src/app/**/page.tsx`: should be thin wrappers that import feature UI.
- `src/app/**/layout.tsx`: layout composition and guards only.
- `src/app/**/route.ts`: HTTP handlers only.

## Components

- Feature UI lives in `src/components/<feature>/`.
- Feature-specific server actions should live with the feature UI:
  - Example: `src/components/dashboard/account-actions.ts`
  - Example: `src/components/preferences/actions.ts`

## Shared Actions

- Cross-feature actions should live in `src/lib/actions/`.
  - Example: `src/lib/actions/user-preferences.ts`

## Naming

- Use explicit names instead of generic `actions.ts` when a folder contains multiple domains:
  - Prefer `settings-actions.ts`, `account-actions.ts`.

## Why

- Keeps `app/` focused on routing concerns.
- Makes feature code discoverable and reusable.
- Reduces coupling between route paths and business logic.