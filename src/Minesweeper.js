import React, { useState, useEffect } from 'react'
import { fromJS } from 'immutable'
import { useInterval } from './hooks'
import { Cell } from './Cell'
import { generateBoard, updateBoard, boardCleared } from './board-logic'
import { Timer } from './Timer'

export const Minesweeper = props => {
  const [difficulty, setDifficulty] = useState(0)
  const [rows, setRows] = useState(10)
  const [cols, setCols] = useState(10)
  const [board, setBoard] = useState(generateBoard(difficulty, rows, cols))

  const [gameStarted, setGameStarted] = useState(false)
  const [playerAlive, setPlayerAlive] = useState(true)
  const [hasWon, setHasWon] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [timer, setTimer] = useState(0)

  const [restoreTime, setRestoreTime] = useState(0)

  const reset = () => {
    setBoard(generateBoard(difficulty, rows, cols))
    setHasWon(false)
    setPlayerAlive(true)
    setGameStarted(false)
    setTimer(0)
  }

  const gameover = () => {
    setPlayerAlive(false)
    setGameStarted(false)
    setBoard(board.map(row => row.map(cell => cell.set('show', true).update('number', val => cell.get('flagged') && !cell.get('isBomb') ? '🚫' : val).set('flagged', false))))

    localStorage.removeItem('board')
    localStorage.removeItem('boardTime')
    localStorage.removeItem('currentTime')
  }

  const restoreGame = () => {
    const savedBoard = localStorage.getItem('board')
    const time = localStorage.getItem('currentTime')

    if (!savedBoard) return

    const restoredBoard = fromJS(JSON.parse(savedBoard))

    setBoard(restoredBoard)
    setPlayerAlive(true)
    setHasWon(false)
    setGameStarted(true)
    setTimer(time)
    setStartTime(Date.now() - (time * 1000))
  }

  const cellClicked = cell => e => {
    e.preventDefault()

    if (playerAlive && !hasWon && !cell.get('flagged') && !cell.get('show')) {
      if (cell.get('isBomb')) {
        return gameover()
      }

      if (!gameStarted) {
        setStartTime(Date.now())
        setGameStarted(true)
      }

      setBoard(updateBoard(board, cell))
    }
  }

  const cellFlagged = cell => e => {
    e.preventDefault()

    if (playerAlive && !hasWon && !cell.get('show')) {
      setBoard(board.updateIn([cell.get('row'), cell.get('col'), 'flagged'], val => !val))

      if (!gameStarted) {
        setStartTime(Date.now())
        setGameStarted(true)
      }
    }
  }

  useEffect(() => {
    if (playerAlive && boardCleared(board)) {
      localStorage.removeItem('board')
      localStorage.removeItem('boardTime')

      setGameStarted(false)
      return setHasWon(true)
    }

    if (gameStarted) {
      const stringBoard = JSON.stringify(board)

      localStorage.setItem('board', stringBoard)
      localStorage.setItem('boardTime', Date.now())
    }
  }, [board])

  useEffect(() => {
    const savedRestoreTime = localStorage.getItem('boardTime')

    setRestoreTime(savedRestoreTime && new Date(Number(savedRestoreTime)).toLocaleString())
  }, [gameStarted])

  useInterval(() => {
    const newTime = Math.floor((Date.now() - startTime) / 1000)

    setTimer(newTime)
    localStorage.setItem('currentTime', newTime)
  }, gameStarted && 1000)

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
    <div className='rows-columns'>
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
      <button className='smiley' onClick={e => reset()}>{hasWon ? '😎' : playerAlive ? '🙂' : '😵'}</button>
    </h2>
    <Timer seconds={timer} />
    {board.map((row, index) => <div key={index} style={{ display: 'flex' }}>
      {row.map((cell, i) => <Cell key={i} cell={cell} onClick={cellClicked(cell)} onContextMenu={cellFlagged(cell)} />)}
    </div>)}
    {restoreTime && !gameStarted && <button className='restore-button' type='button' onClick={e => restoreGame()}>
      Restore Game from: {restoreTime}
    </button>}
  </main>
}