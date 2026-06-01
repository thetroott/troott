import { createContext } from 'react';
import type { AdminProfileDTO, AdminResponseDTO } from '@/dtos/admin.dto';
import type { ICollection } from '@/utils/interfaces.util';

export interface AdminContextValue {
    adminProfile: AdminProfileDTO | null;
    admins: ICollection;
    isLoading: boolean;
    error: string | null;
    refreshProfile: (options?: { force?: boolean }) => Promise<AdminProfileDTO | null>;
    loadAdmins: (params?: Record<string, unknown>) => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export default AdminContext;
