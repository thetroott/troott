/** Local storage contract used by [`local-storage.ts`](./services/local-storage.ts). */
export interface IStorage {
    storeAuth(
        token: string,
        id: string,
        userType: string,
        email: string,
        businessType?: string,
    ): void;
    checkToken(): boolean;
    getToken(): string | null;
    setToken(token: string): void;
    checkUserID(): boolean;
    getUserID(): string;
    checkUserType(): boolean;
    getUserType(): string | null;
    checkUserEmail(): boolean;
    getUserEmail(): string | null;
    checkBusinessType(): boolean;
    getBusinessType(): string | null;
    setStudioCode(code: string): void;
    getStudioCode(): string;
    getConfig(): Record<string, unknown>;
    getConfigWithBearer(): Record<string, unknown>;
    clearAuth(): void;
    keep(key: string, data: unknown): boolean;
    keepLegacy(key: string, data: unknown): boolean;
    fetch(key: string): unknown;
    fetchLegacy(key: string): unknown;
    deleteItem(key: string, legacy?: boolean): boolean;
    trimSpace(str: string): string;
    copyCode(code: string): boolean;
    debugAuth(): Record<string, unknown>;
}
