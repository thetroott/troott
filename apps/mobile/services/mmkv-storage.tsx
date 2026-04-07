import { IGetData, ISetData } from "@/utils/interface.utl";
import { MMKV } from "react-native-mmkv";

/**
 * Auth/session key-value storage. Uses MMKV when JSI is available; otherwise in-memory for the session.
 */
class StorageService {
	private mmkv: MMKV | null = null;
	private readonly memory = new Map<string, string>();
	private mmkvFailed = false;

	private ensure(): { native: MMKV | null; memory: Map<string, string> } {
		if (this.mmkvFailed) return { native: null, memory: this.memory };
		if (this.mmkv) return { native: this.mmkv, memory: this.memory };
		try {
			this.mmkv = new MMKV();
			return { native: this.mmkv, memory: this.memory };
		} catch {
			this.mmkvFailed = true;
			console.warn(
				"[mmkv-storage] MMKV unavailable; using in-memory store for this session (disable Chrome remote debugging for MMKV).",
			);
			return { native: null, memory: this.memory };
		}
	}

	public async setData(data: ISetData): Promise<void> {
		const { key, payload } = data;
		const value =
			typeof payload === "object" ? JSON.stringify(payload) : String(payload);
		const { native, memory } = this.ensure();
		if (native) native.set(key, value);
		else memory.set(key, value);
	}

	public async getData(data: IGetData): Promise<unknown> {
		const { key, parse = false } = data;
		const { native, memory } = this.ensure();
		const value = native ? native.getString(key) : memory.get(key);
		if (!value) return null;
		if (parse) {
			try {
				return JSON.parse(value) as unknown;
			} catch {
				return value;
			}
		}
		return value;
	}

	public async checkData(key: string): Promise<boolean> {
		const { native, memory } = this.ensure();
		return native ? native.contains(key) : memory.has(key);
	}

	public async removeData(key: string): Promise<void> {
		const { native, memory } = this.ensure();
		if (native) native.delete(key);
		else memory.delete(key);
	}

	public async clearAll(): Promise<void> {
		const { native, memory } = this.ensure();
		if (native) native.clearAll();
		else memory.clear();
	}

	public async multiKeep(
		items: { key: string; data: object | string }[],
	): Promise<void> {
		for (const { key, data } of items) {
			const value = typeof data === "object" ? JSON.stringify(data) : data;
			await this.setData({ key, payload: value });
		}
	}

	public async multiFetch(
		keys: string[],
	): Promise<{ [key: string]: unknown | null }> {
		const result: { [key: string]: unknown | null } = {};
		for (const key of keys) {
			const raw = await this.getData({ key, parse: false });
			if (typeof raw === "string") {
				try {
					result[key] = JSON.parse(raw) as unknown;
				} catch {
					result[key] = raw;
				}
			} else {
				result[key] = raw;
			}
		}
		return result;
	}

	public async multiRemove(keys: string[]): Promise<void> {
		for (const key of keys) {
			await this.removeData(key);
		}
	}

	public async getConfig() {
		return {
			headers: {
				ContentType: "application/json",
				lg: "en",
				ch: "web",
			},
		};
	}
}

const mmkvstorage = new StorageService();
export default mmkvstorage;
