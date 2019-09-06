import React from 'react'

const scheme = {
  1: 'blue',
  2: 'darkgreen',
  3: 'red',
  4: 'darkblue',
  5: 'maroon',
  6: 'turquoise',
  7: 'black',
  8: 'gray'
}

export const Cell = ({ cell, onClick, onContextMenu }) => {
  const flagged = cell.get('flagged')
  const show = cell.get('show')
  const number = cell.get('number')

  const cellValue = `${cell.get('isBomb') ? '💣' : number || ''}`

  return <div
    className={`cell ${show ? 'open-cell' : 'closed-cell'}`}
    style={{ color: scheme[number] || 'black' }}
    onClick={onClick}
    onContextMenu={onContextMenu}
  >
    {flagged ? '🚩' : show ? cellValue : ''}
  </div>
}