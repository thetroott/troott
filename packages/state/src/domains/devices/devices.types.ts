export interface DevicesState {
    connected: unknown[];
    activeDeviceId: string | null;
    carMode: boolean;
    smartSpeakers: unknown[];
    pushDevices: Record<
        string,
        { token: string; platform: string; label: string; lastSeenAt: string }
    >;
    network: { status: 'online' | 'offline' | 'unknown'; since: string | null };
    deviceProfiles: {
        streaming: unknown;
        downloading: unknown;
    };
}

export type DevicesAction = { type: string; payload?: unknown };
