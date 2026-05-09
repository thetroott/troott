import type { ReactNode } from 'react';

/**
 * @deprecated Use {@link TroottStateProvider} once at the app root. This component is a no-op pass-through.
 */
const AppState = (props: { children: ReactNode }) => <>{props.children}</>;

export default AppState;
