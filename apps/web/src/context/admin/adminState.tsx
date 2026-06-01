import {
    useCallback,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import api from '@/api/config';
import type { AdminProfileDTO, AdminResponseDTO } from '@/dtos/admin.dto';
import type { ICollection } from '@/utils/interfaces.util';
import AdminContext from './adminContext';

const emptyCollection = (): ICollection => ({
    data: [],
    count: 0,
    total: 0,
    pagination: {
        next: { page: 1, limit: 25 },
        prev: { page: 1, limit: 25 },
    },
    loading: false,
    message: 'There are no data currently',
});

function parseAdminProfile(data: unknown): AdminProfileDTO | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const raw = data as { admin?: AdminProfileDTO } | AdminProfileDTO;
    if ('admin' in raw && raw.admin) {
        return raw.admin;
    }
    if ('id' in raw && 'code' in raw) {
        return raw as AdminProfileDTO;
    }
    return null;
}

export function AdminState({ children }: { children: ReactNode }) {
    const [adminProfile, setAdminProfile] = useState<AdminProfileDTO | null>(
        null,
    );
    const [admins, setAdmins] = useState<ICollection>(emptyCollection);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const profileLoadedRef = useRef(false);

    const refreshProfile = useCallback(async (options?: { force?: boolean }) => {
        if (profileLoadedRef.current && !options?.force && adminProfile) {
            return adminProfile;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await api.admin.getProfile();
            if (res.error) {
                setAdminProfile(null);
                setError(res.message || 'Failed to load admin profile');
                profileLoadedRef.current = false;
                return null;
            }

            const parsed = parseAdminProfile(res.data);
            setAdminProfile(parsed);
            profileLoadedRef.current = Boolean(parsed);
            return parsed;
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Failed to load admin profile';
            setAdminProfile(null);
            setError(message);
            profileLoadedRef.current = false;
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [adminProfile]);

    const loadAdmins = useCallback(async (params?: Record<string, unknown>) => {
        setAdmins((prev) => ({ ...prev, loading: true }));
        try {
            const res = await api.admin.listAdmins(params);
            if (res.error) {
                setAdmins({
                    ...emptyCollection(),
                    loading: false,
                    message: res.message || 'Failed to load admins',
                });
                return;
            }

            const list = Array.isArray(res.data)
                ? (res.data as AdminResponseDTO[])
                : [];
            setAdmins({
                data: list,
                count: res.count ?? list.length,
                total: res.total ?? list.length,
                pagination: res.pagination ?? emptyCollection().pagination,
                loading: false,
                message:
                    list.length > 0
                        ? `displaying ${res.count ?? list.length} admins`
                        : 'There are no admins currently',
            });
        } catch (e) {
            setAdmins({
                ...emptyCollection(),
                loading: false,
                message:
                    e instanceof Error ? e.message : 'Failed to load admins',
            });
        }
    }, []);

    const value = useMemo(
        () => ({
            adminProfile,
            admins,
            isLoading,
            error,
            refreshProfile,
            loadAdmins,
        }),
        [
            adminProfile,
            admins,
            isLoading,
            error,
            refreshProfile,
            loadAdmins,
        ],
    );

    return (
        <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
    );
}

export default AdminState;
