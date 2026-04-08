
import { v4 as randomUUID } from 'uuid';
import mmkvstorage from './mmkv-storage';


class IdempotentService {
  private key = 'XHIT';

  async getRequestKey(): Promise<string> {
    const raw = await mmkvstorage.getData({ key: this.key, parse: false });
    if (typeof raw === "string" && raw.length > 0) {
      return raw;
    }
    return this.setRequestKey();
  }

  async setRequestKey(): Promise<string> {
    const idempKey = randomUUID();
    await mmkvstorage.setData({key: this.key, payload: idempKey});
    return idempKey;
  }
}

export default new IdempotentService();
