import { IGetData, ISetData } from "@/utils/interface.utl";
import { MMKV } from "react-native-mmkv";

/**
 * A service class to handle all MMKV storage operations.
 * It encapsulates methods for storing, fetching, updating, and removing data.
 */
class StorageService {
    private mmkv: MMKV;

    /**
     * Constructs a new StorageService instance.
     * Initializes the MMKV instance for use throughout the class.
     */
    constructor() {
        this.mmkv = new MMKV();
    }


    public async setData(data: ISetData): Promise<void> {
        const { key, payload } = data;

        const value = typeof payload === "object" ? JSON.stringify(payload) : payload;
        this.mmkv.set(key, value);

    }


    public async getData(data: IGetData): Promise<any> {
        const { key, parse = false } = data;


        const value = this.mmkv.getString(key);
        if (!value) {
            return null;
        }
    }


    public async checkData(key: string): Promise<boolean> {

        return this.mmkv.contains(key);

    }


    public async removeData(key: string): Promise<void> {

        this.mmkv.delete(key);

    }


    public async clearAll(): Promise<void> {

        this.mmkv.clearAll();

    }


    public async multiKeep(
        items: { key: string; data: object | string }[]
    ): Promise<void> {

        for (const { key, data } of items) {
            const value = typeof data === "object" ? JSON.stringify(data) : data;
            this.mmkv.set(key, value);
        }

    }


    public async multiFetch(
        keys: string[]
    ): Promise<{ [key: string]: any | null }> {

        const result: { [key: string]: any } = {};
        for (const key of keys) {
            const value = this.mmkv.getString(key);
            result[key] = value ? JSON.parse(value) : null;
        }
        return result;

    }

    /**
     * Removes multiple items from storage.
     * @param {string[]} keys - Array of keys to remove.
     * @returns {Promise<void>}
     */
    public async multiRemove(keys: string[]): Promise<void> {

        for (const key of keys) {
            this.mmkv.delete(key);
        }

    }

    public async getConfig () {

        const config = {
            headers: {
                ContentType: 'application/json',
                lg: 'en',
                ch: 'web'
            }
        }
    
        return config;
    
    }

}





// Export a single instance of the class for use across the application
const mmkvstorage = new StorageService();
export default mmkvstorage;


