import { createDomainContext } from '../_shared/createDomain';
import { devicesReducer } from './devices.reducer';
import { devicesInitial } from './devices.seed';
import type { DevicesAction, DevicesState } from './devices.types';

const d = createDomainContext<DevicesState, DevicesAction>(
    'devices',
    devicesReducer,
    devicesInitial,
);

export const DevicesProvider = d.Provider;
export const useDevicesState = d.useState;
export const useDevicesDispatch = d.useDispatch;
