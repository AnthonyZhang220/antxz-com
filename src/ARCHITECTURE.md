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

## Error and Loading Conventions

- Global unrecoverable errors: use `src/app/global-error.tsx`.
- Route/domain-level errors: add `error.tsx` under that route segment (example: dashboard).
- First-load failures inside client widgets: render inline `ErrorState` in the same card/page area with retry.
- User-triggered action failures/successes (save/delete/like): use toast helpers in `src/lib/error-utils.ts`.
- Route transition loading: add `loading.tsx` per segment and prefer skeletons over full-screen spinners.
- Keep API/Server Action responses in a shared `ActionResult<T>` shape from `src/lib/action-result.ts`.

## Why

- Keeps `app/` focused on routing concerns.
- Makes feature code discoverable and reusable.
- Reduces coupling between route paths and business logic.
- Gives consistent UX for full-screen errors, inline errors, toasts, and loading states.