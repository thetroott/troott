import { useContext } from 'react';
import CreatorContext from './creatorContext';

export function useCreator() {
    const ctx = useContext(CreatorContext);
    if (!ctx) {
        throw new Error('useCreator must be used within CreatorState');
    }
    return ctx;
}

export default useCreator;
