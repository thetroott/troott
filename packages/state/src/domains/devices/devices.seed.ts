import type { DevicesState } from './devices.types';

export const devicesInitial: DevicesState = {
    connected: [],
    activeDeviceId: null,
    carMode: false,
    smartSpeakers: [],
    pushDevices: {},
    network: { status: 'unknown', since: null },
    deviceProfiles: {
        streaming: null,
        downloading: null,
    },
};
