import { useContext } from 'react';
import AdminContext from './adminContext';

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) {
        throw new Error('useAdmin must be used within AdminState');
    }
    return ctx;
}

export default useAdmin;
