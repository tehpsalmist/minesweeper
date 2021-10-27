import React, { useState, useEffect, useRef } from 'react'

// Thanks, Dan Abramov. https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useInterval (callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick () {
      savedCallback.current()
    }

    if (delay) {
      const id = setInterval(tick, delay)

      return () => clearInterval(id)
    }
  }, [delay])
}

export function useRememberedState(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);

      if (item == null) {
        const newValue = typeof initialValue === 'function' ? initialValue() : initialValue

        localStorage.setItem(key, JSON.stringify(newValue))

        return newValue
      }

      return item ? JSON.parse(item) : item;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = value => {
    const valueToStore = typeof value === 'function' ? value(storedValue) : value;

    setStoredValue(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}

export const useOnlyOnce = (callback, condition = true) => {
  const hasRunOnce = useRef(false);

  if (!hasRunOnce.current && condition) {
    callback();
    hasRunOnce.current = true;
  }
}
