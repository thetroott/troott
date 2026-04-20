import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    listPushDevices,
    registerPushDevice,
    removePushDevice,
} from './push-device.controller';

const pushDeviceRouter = Router({ mergeParams: true });

pushDeviceRouter.post('/device', Protect, registerPushDevice);
pushDeviceRouter.delete('/device', Protect, removePushDevice);
pushDeviceRouter.get('/device', Protect, listPushDevices);

export default pushDeviceRouter;
