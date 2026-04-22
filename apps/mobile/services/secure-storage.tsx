import { IGetData, IRemoveData, ISetData } from '@/utils/interface.utl';
import * as Keychain from 'react-native-keychain';

// Define a unique service name for your application's data
const SERVICE_NAME = 'com.troott.secure-data';

// A consistent username for the single JSON blob that holds all user data
const DATA_USERNAME = 'troott-user-data';

class SecureStorageService {
    /**
     * @name getSecureData
     * @description Retrieves and parses the entire JSON data object from the keychain.
     * @private
     * @returns {Promise<Record<string, any>>} A promise that resolves to the data object or an empty object.
     */
    private async getSecureData(): Promise<Record<string, any>> {
        const credentials = await Keychain.getGenericPassword({
            service: SERVICE_NAME,
        });
        if (credentials && credentials.password) {
            return JSON.parse(credentials.password);
        }
        return {};
    }

    /**
     * @name setData
     * @param data
     */
    public async setData(data: ISetData): Promise<void> {
        const { key, payload } = data;
        if (!key || payload === undefined) {
            return;
        }

        const currentData = await this.getSecureData();
        const payloadString =
            typeof payload === 'object'
                ? JSON.stringify(payload)
                : payload.toString();
        currentData[key] = payloadString;

        await Keychain.setGenericPassword(
            DATA_USERNAME,
            JSON.stringify(currentData),
            { service: SERVICE_NAME },
        );
    }

    /**
     * @name getData
     * @param data
     * @returns
     */
    public async getData(data: IGetData): Promise<any> {
        const { key, parse = false } = data;
        if (!key) {
            return null;
        }

        const currentData = await this.getSecureData();
        const result = currentData[key];

        if (result && parse) {
            return JSON.parse(result);
        }
        return result || null;
    }

    /**
     * @name checkData
     * @description Checks if a specific key exists in the keychain.
     * @param {string} key - The key (e.g., "userType") to check for.
     * @returns {Promise<boolean>} True if the key exists, false otherwise.
     */
    public async checkData(key: string): Promise<boolean> {
        // Attempt to retrieve the item using the service name and the specific key.
        const currentData = await this.getSecureData();
        return currentData.hasOwnProperty(key);
    }

    /**
     * @name removeData
     * @param data
     */
    public async removeData(data: IRemoveData): Promise<void> {
        const { key } = data;
        if (!key) {
            return;
        }

        const currentData = await this.getSecureData();
        if (currentData[key] !== undefined) {
            delete currentData[key];
            await Keychain.setGenericPassword(
                DATA_USERNAME,
                JSON.stringify(currentData),
                { service: SERVICE_NAME },
            );
        }
    }

    /**
     * @name resetAllData
     * @description Encapsulates the Keychain.resetGenericPassword() method to clear all stored credentials.
     * This is useful for a full logout or session clear.
     * @returns {Promise<boolean>} A promise that resolves to true if successful, false otherwise.
     */
    public async resetAllData(): Promise<boolean> {
        // Calling the Keychain.resetGenericPassword() method to remove all credentials
        const success = await Keychain.resetGenericPassword();

        if (success) {
            console.log('Successfully reset all keychain data.');
            return true;
        } else {
            console.log('Failed to reset keychain data.');
            return false;
        }
    }
}

const secureStorage: SecureStorageService = new SecureStorageService();
export default secureStorage;
