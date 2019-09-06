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