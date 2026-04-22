

export interface IStorage {
    storeAuth(token: string, id: string, userType: string, email: string, businessType?: string): void;
    checkToken(): boolean;
    getToken(): string | null;
    checkUserID(): boolean;
    getUserID(): string;
    checkUserType(): boolean;
    getUserType(): string | null;
    checkUserEmail(): boolean;
    getUserEmail(): string | null;
    checkBusinessType(): boolean;
    getBusinessType(): string | null;

    getConfig(): any;
    getConfigWithBearer(): any;
    clearAuth(): void;
    keep(key: string, data: any): boolean;
    fetch(key: string): any;
    deleteItem(key: string): boolean;
    trimSpace(str: string): string;
    copyCode(code: string): boolean;
    debugAuth(): any;
}

