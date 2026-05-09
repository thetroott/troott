/** Mirrors backend discriminated profile payloads (`apps/api` profile module). */
export type ProfileDTO =
    | {
          kind: 'listener';
          userId: string;
          displayName?: string;
          avatar?: string;
          bio?: string;
          [key: string]: unknown;
      }
    | {
          kind: 'minister';
          userId: string;
          ministerialName?: string;
          avatar?: string;
          bio?: string;
          [key: string]: unknown;
      };
