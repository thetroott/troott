import { createContext } from 'react';

import type { IUploadContextValue } from './types';

const UploadContext = createContext<IUploadContextValue | null>(null);

export default UploadContext;
