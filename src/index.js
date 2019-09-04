import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'
import { List, Map } from 'immutable'

const neighbors = [
  { col: -1, row: -1 },
  { col: 0, row: -1 },
  { col: 1, row: -1 },
  { col: -1, row: 0 },
  { col: 1, row: 0 },
  { col: -1, row: 1 },
  { col: 0, row: 1 },
  { col: 1, row: 1 }
]

const generateBoard = (difficulty = 0, rows = 10, cols = 10) => {
  const board = List(Array(rows).fill(1).map((n, row) => List(Array(cols).fill(1).map((n, col) => Map({
    row,
    col,
    isBomb: Math.random() < (0.1 + (0.025 * difficulty)),
    flagged: false,
    show: false
  })))))

  return board.map(row => row.map(cell => {
    const number = !cell.get('isBomb') && neighbors.reduce((total, nbor) => {
      const ri = cell.get('row') + nbor.row
      const ci = cell.get('col') + nbor.col

      if (ci > -1 && ri > -1 && board.has(ri) && board.get(ri).has(ci)) {
        return total + (board.get(ri).get(ci).get('isBomb') ? 1 : 0)
      }

      return total
    }, 0)

    return cell.set('number', number)
  }))
}

const updateBoard = (board, cell) => {
  if ((!cell.get('flagged')) && !cell.get('show')) {
    const newBoard = board.updateIn([cell.get('row'), cell.get('col'), 'show'], val => true)

    if (cell.get('number') > 0) {
      return newBoard
    }

    return neighbors.reduce((brd, nbor) => {
      const ri = cell.get('row') + nbor.row
      const ci = cell.get('col') + nbor.col

      if (ci > -1 && ri > -1 && brd.has(ri) && brd.get(ri).has(ci)) {
        return updateBoard(brd, brd.get(ri).get(ci))
      }

      return brd
    }, newBoard)
  }

  return board
}

const boardCleared = board => board.flatten(true).every(cell => cell.get('isBomb') || cell.get('show'))

export const Cell = ({ cell, onClick, onContextMenu }) => {
  const flagged = cell.get('flagged')
  const show = cell.get('show')
  const number = cell.get('number')

  const cellValue = `${cell.get('isBomb') ? '🧨' : number || ''}`

  return <div
    className={`cell${show ? ' open-cell' : ''}`}
    onClick={onClick}
    onContextMenu={onContextMenu}
  >
    {flagged ? '🚩' : show ? cellValue : ''}
  </div>
}

export const Minesweeper = props => {
  const [difficulty, setDifficulty] = useState(0)
  const [rows, setRows] = useState(10)
  const [cols, setCols] = useState(10)
  const [board, setBoard] = useState(generateBoard(difficulty, rows, cols))

  const [playerAlive, setPlayerAlive] = useState(true)
  const [hasWon, setHasWon] = useState(false)

  const reset = () => {
    setBoard(generateBoard(difficulty, rows, cols))
    setHasWon(false)
    setPlayerAlive(true)
  }

  const gameover = () => {
    setPlayerAlive(false)
    setBoard(board.map(row => row.map(cell => cell.set('show', true).update('number', val => cell.get('flagged') && !cell.get('isBomb') ? '🚫' : val).set('flagged', false))))
  }

  const cellClicked = cell => e => {
    e.preventDefault()

    if (playerAlive && !hasWon && !cell.get('flagged') && !cell.get('show')) {
      if (cell.get('isBomb')) {
        return gameover()
      }

      setBoard(updateBoard(board, cell))
    }
  }

  const cellFlagged = cell => e => {
    e.preventDefault()

    if (playerAlive && !hasWon && !cell.get('show')) {
      setBoard(board.updateIn([cell.get('row'), cell.get('col'), 'flagged'], val => !val))
    }
  }

  useEffect(() => {
    if (playerAlive && boardCleared(board)) {
      setHasWon(true)
    }
  }, [board])

  return <main style={{ width: `${board.get(0).count() * 42}px` }} className='board'>
    <h1 style={{ textAlign: 'center' }}>Mine Sweeper</h1>
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      <label htmlFor='difficulty'>Difficulty:</label>
      <div>
        Easy
        <input id='difficulty' type='range' min={0} max={4} value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} />
        Hard
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-evenly', marginTop: '20px' }}>
      <label htmlFor='rows'>
        Rows:
        {' '}
        <input id='rows' type='number' max={100} min={10} value={rows} onChange={e => setRows(Number(e.target.value))} />
      </label>
      <label htmlFor='cols'>
        Columns:
        {' '}
        <input id='cols' type='number' max={100} min={10} value={cols} onChange={e => setCols(Number(e.target.value))} />
      </label>
    </div>
    <h2 className='smiley-row'>
      <button className='smiley' onClick={e => reset()}>{hasWon ? '🥳' : playerAlive ? '🙂' : '😵'}</button>
    </h2>
    {board.map((row, index) => <div key={index} style={{ display: 'flex' }}>
      {row.map((cell, i) => <Cell key={i} cell={cell} onClick={cellClicked(cell)} onContextMenu={cellFlagged(cell)} />)}
    </div>)}
  </main>
}

render(<Minesweeper />, document.getElementById('minesweeper'))
