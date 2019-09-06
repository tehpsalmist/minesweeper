import React from 'react'

export const Cell = ({ cell, onClick, onContextMenu }) => {
  const flagged = cell.get('flagged')
  const show = cell.get('show')
  const number = cell.get('number')

  const cellValue = `${cell.get('isBomb') ? '💣' : number || ''}`

  return <div
    className={`cell ${show ? 'open-cell' : 'closed-cell'}`}
    onClick={onClick}
    onContextMenu={onContextMenu}
  >
    {flagged ? '🚩' : show ? cellValue : ''}
  </div>
}