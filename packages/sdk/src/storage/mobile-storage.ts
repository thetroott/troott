/**
 * React Native entry: construct {@link AsyncStorageAdapter} with your async store.
 *
 * @example
 * ```ts
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import { AsyncStorageAdapter } from '@troott/sdk';
 * const authStorage = new AsyncStorageAdapter(AsyncStorage);
 * ```
 */
export { AsyncStorageAdapter, type IAsyncKeyValueStore } from './async-storage-adapter';
