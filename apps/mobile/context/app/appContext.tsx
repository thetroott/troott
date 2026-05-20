import { createContext } from 'react';
import type { IAppContextValue } from './types';

const AppContext = createContext<IAppContextValue | null>(null);

export default AppContext;
