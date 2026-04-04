
import { v4 as randomUUID } from 'uuid';
import mmkvstorage from './mmkv-storage';


class IdempotentService {
  private key = 'XHIT';

  async getRequestKey(): Promise<string> {
    let key = await mmkvstorage.getData({ key: this.key, parse: false });
    if (!key) {
      key = await this.setRequestKey();
    }
    return key;
  }

  async setRequestKey(): Promise<string> {
    const idempKey = randomUUID();
    await mmkvstorage.setData({key: this.key, payload: idempKey});
    return idempKey;
  }
}

export default new IdempotentService();
