import { MMKV } from 'react-native-mmkv'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { AsyncStorage as TanstackAsyncStorage } from '@tanstack/react-query-persist-client'
import { StateStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

let _storage: MMKV | null = null

function getMMKV(): MMKV | null {
  if (_storage !== null) return _storage
  try {
    console.debug('Building MMKV storage')
    _storage = new MMKV()
    return _storage
  } catch (e) {
    console.warn('MMKV unavailable (e.g. remote debugger or JSI not ready), using AsyncStorage fallback:', e)
    return null
  }
}

export const storage = new Proxy({} as MMKV, {
  get(_, prop) {
    const inst = getMMKV()
    if (inst) return (inst as Record<string, unknown>)[prop as string]
    return undefined
  },
})

const storageFunctions = {
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value)
  },
  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key)
    return value === undefined ? null : value
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key)
  },
}

const mmkvStorageFunctions: StateStorage = {
  setItem: (key: string, value: string) => {
    const inst = getMMKV()
    if (inst) inst.set(key, value)
  },
  getItem: (key: string) => {
    const inst = getMMKV()
    if (inst) {
      const value = inst.getString(key)
      return value === undefined ? null : value
    }
    return null
  },
  removeItem: (key: string) => {
    const inst = getMMKV()
    if (inst) inst.delete(key)
  },
}

const clientStorage: TanstackAsyncStorage<string> = storageFunctions

export const queryClientPersister = createAsyncStoragePersister({
  storage: clientStorage,
})

export const stateStorage: StateStorage = storageFunctions

export const mmkvStateStorage: StateStorage = mmkvStorageFunctions
