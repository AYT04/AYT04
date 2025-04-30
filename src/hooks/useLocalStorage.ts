import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = (): T => {
    // Prevent build errors from using window object
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    // Prevent build errors from using window object
    if (typeof window == 'undefined') {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
    }

    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

   // Read localStorage again if the key changes
   useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);


  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window.localStorage) {
        try {
            if (event.newValue) {
                setStoredValue(JSON.parse(event.newValue) as T);
            } else {
                 setStoredValue(initialValue); // Handle item removal
            }

        } catch (error) {
             console.warn(`Error parsing storage event value for key “${key}”:`, error);
        }
      }
    };

     if (typeof window !== 'undefined') {
       window.addEventListener('storage', handleStorageChange);
       return () => {
         window.removeEventListener('storage', handleStorageChange);
       };
     }
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
