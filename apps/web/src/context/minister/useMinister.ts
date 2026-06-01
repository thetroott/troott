import { useContext } from 'react';
import MinisterContext from './ministerContext';

export function useMinister() {
    const ctx = useContext(MinisterContext);
    if (!ctx) {
        throw new Error('useMinister must be used within MinisterState');
    }
    return ctx;
}

export default useMinister;
