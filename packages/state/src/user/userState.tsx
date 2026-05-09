import type { ReactNode } from 'react';

/**
 * @deprecated Use {@link TroottStateProvider} once at the app root. This component is a no-op pass-through.
 */
const UserState = (props: { children: ReactNode }) => <>{props.children}</>;

export default UserState;
