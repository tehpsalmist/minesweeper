import React from 'react'

export const Timer = ({ seconds }) => {
  return <div className='timer'>
    {formatTimer(seconds)}
  </div>
}

export function formatTimer (seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor(seconds / 60) % 60
  const secs = seconds % 60

  return `${hours ? hours + ':' : ''}${hours ? twoDigit(minutes) : minutes}:${twoDigit(secs)}`
}

function twoDigit (number) {
  const string = String(number)

  return string.length >= 2 ? string : '0'.repeat(2 - string.length) + string
}
