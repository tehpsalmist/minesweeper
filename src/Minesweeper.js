import React, { useState, useEffect } from 'react'
import { fromJS } from 'immutable'
import { useInterval } from './hooks'
import { Cell } from './Cell'
import { generateBoard, updateBoard, boardCleared } from './board-logic'
import { Timer } from './Timer'
import { saveToLeaderboard, Leaderboard, getLeaderboard } from './leaderboard'

export const Minesweeper = props => {
  const [name, setName] = useState(localStorage.getItem('ms-player-name') || 'Anonymous')
  const updateName = n => {
    localStorage.setItem('ms-player-name', n)
    setName(n)
  }

  const [difficulty, setDifficulty] = useState(Number(localStorage.getItem('ms-difficulty')) || 0)

  const [rows, setRows] = useState(10)
  const [cols, setCols] = useState(10)
  const [board, setBoard] = useState(() => generateBoard(difficulty, rows, cols))

  const [gameStarted, setGameStarted] = useState(false)
  const [playerAlive, setPlayerAlive] = useState(true)
  const [hasWon, setHasWon] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [timer, setTimer] = useState(0)

  const [restoreTime, setRestoreTime] = useState(0)

  const [leaderboard, setLeaderboard] = useState(() => getLeaderboard())

  const reset = (r = rows, c = cols, d = difficulty) => {
    setBoard(generateBoard(d, r, c))
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
    const savedDifficulty = localStorage.getItem('ms-difficulty')

    if (!savedBoard) return

    const restoredBoard = fromJS(JSON.parse(savedBoard))

    setBoard(restoredBoard)
    setDifficulty(savedDifficulty)
    setPlayerAlive(true)
    setHasWon(false)
    setGameStarted(true)
    setTimer(time)
    setStartTime(Date.now() - (time * 1000))
  }

  const cellClicked = cell => e => {
    e.preventDefault()

    if (!gameStarted && !hasWon && playerAlive && cell.get('isBomb')) {
      const generateSafeBoard = (r, c) => {
        const newBoard = generateBoard(difficulty, rows, cols)

        if (newBoard.get(r).get(c).get('isBomb')) {
          return generateSafeBoard(r, c)
        }

        return newBoard
      }

      const safeBoard = generateSafeBoard(cell.get('row'), cell.get('col'))
      const newCell = safeBoard.get(cell.get('row')).get(cell.get('col'))

      return setBoard(updateBoard(safeBoard, newCell))
    }

    if (playerAlive && !hasWon && !cell.get('flagged') && !cell.get('show')) {
      if (cell.get('isBomb')) {
        return gameover()
      }

      if (!gameStarted) {
        setStartTime(Date.now())
        setGameStarted(true)
        localStorage.setItem('ms-difficulty', difficulty)
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
      setLeaderboard(saveToLeaderboard(timer, board.size, board.get(0).size, difficulty, name))
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
    <h1 style={{ textAlign: 'center' }}><pre>minesweeper</pre></h1>
    <div className='name-difficulty'>
      <label>Challenger:</label>
      <input className='name-input' value={name} onChange={e => updateName(e.target.value)} />
      <label htmlFor='difficulty'>Difficulty:</label>
      <div>
        Easy
        <input
          id='difficulty'
          type='range'
          min={0}
          max={4}
          value={difficulty}
          onChange={e => setDifficulty(Number(e.target.value))}
          disabled={gameStarted}
        />
        Hard
      </div>
    </div>
    <div className='rows-columns'>
      <label htmlFor='rows'>
        Rows:
        {' '}
        <input
          id='rows'
          type='number'
          max={100}
          min={10}
          value={rows}
          onChange={e => setRows(Number(e.target.value))}
          disabled={gameStarted}
        />
      </label>
      <label htmlFor='cols'>
        Columns:
        {' '}
        <input
          id='cols'
          type='number'
          max={100}
          min={10}
          value={cols}
          onChange={e => setCols(Number(e.target.value))}
          disabled={gameStarted}
        />
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
    <Leaderboard leaderboard={leaderboard} chooseGame={reset} />
  </main>
}