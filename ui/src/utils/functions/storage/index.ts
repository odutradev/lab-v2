import type { PersistStorage, StorageValue } from 'zustand/middleware'

export interface RawStorageAdapter<T> {
  read: () => T
  write: (state: T) => void
  clear: () => void
}

// Adapta o middleware persist do zustand ao formato bruto já salvo no localStorage,
// mantendo as chaves e o formato existentes para não perder dados de usuários.
export const createRawPersistStorage = <T>(adapter: RawStorageAdapter<T>): PersistStorage<T> => ({
  getItem: (): StorageValue<T> => ({ state: adapter.read(), version: 0 }),
  setItem: (_name: string, value: StorageValue<T>) => adapter.write(value.state),
  removeItem: () => adapter.clear()
})

export const readJson = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export const writeJson = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}
