import { useEffect,useState } from 'react'

/**
 * 使用 localStorage 的 Hook
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 获取初始值
  const getInitialValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  const [storedValue, setStoredValue] = useState<T>(getInitialValue)

  // 挂载时读取 localStorage
  useEffect(() => {
    setStoredValue(getInitialValue())
  }, [key])

  // 更新 localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // 监听其他标签页的更改
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue)
          setStoredValue(newValue)
        } catch (error) {
          console.warn(`Error parsing storage change for "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue] as const
}

/**
 * 使用 Session Storage 的 Hook
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
  const getInitialValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  }

  const [storedValue, setStoredValue] = useState<T>(getInitialValue)

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

/**
 * 清除特定的 localStorage 键
 */
export function clearLocalStorage(key: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key)
  }
}

/**
 * 清除所有 localStorage
 */
export function clearAllLocalStorage(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
  }
}

/**
 * 检查 localStorage 是否可用
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}
