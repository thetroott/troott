import DeviceDetector from 'node-device-detector';
import { DateTime } from 'luxon';

const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
});

interface Device {
    time: string;
    device: string;
    os: string;
    browser: string;
}

class DetectDevice {
    // detect user device
    static async addDeviceInfo(userAgent: any) {
        // update device info
        const device = detector.detect(userAgent);

        const deviceDetail = {
            time: DateTime.now().toLocaleString(DateTime.DATETIME_FULL),
            device: device.device.brand,
            os: device.os.name,
            browser: device.client.name,
        };

        return deviceDetail;
    }

    // compare user record with detected device.
    static async compare(storedInfo: any, detectedInfo: Device) {
        let areEqual = false;

        if (
            storedInfo.device === detectedInfo.device &&
            storedInfo.os === detectedInfo.os &&
            storedInfo.browser === detectedInfo.browser
        ) {
            areEqual = true;
        }

        return areEqual;
    }
}

export default DetectDevice;
