# Migration playbook: legacy app APIs to `@troott/api-client`

## Imports

- Replace `import apiCall from '@/api/config'` with `@troott/api-client` singleton pattern (`clients/troott` side-effect + `troottAPIClient()`).
- Replace `axiosPrivate.get/post` wrappers with resource classes (`troottAPIClient().sermon.*`) or `getHttpClient()` for upload progress.

## State

- Prefer `@troott/state` providers for new surfaces; legacy zustand stores can coexist behind `src/state/useContextType.tsx` shim until hooks are rewritten.

## Codemod sketch

- `apiCall.` -> `troottAPIClient().`
- `@/api/foo` -> `@troott/api-client` / resource method names.

## Manual audit

- Grep for `/talent`, `/workspace`, hackathon strings — remove dead flows.
