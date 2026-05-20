import { createContext } from 'react';

import type { IDraftContextValue } from './types';

const DraftContext = createContext<IDraftContextValue | null>(null);

export default DraftContext;
