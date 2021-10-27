import { fromJS } from 'immutable'

export const saveLocally = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getLocally = (key) => {
  const thing = localStorage.getItem(key)

  if (thing) {
    try {
      return JSON.parse(thing)
    } catch (e) {
      console.error('bad json:', thing)
      return null
    }
  }

  return null
}

export const saveGame = ({ board, boardTime, currentTime, name, email, rows, cols, difficulty }) => {
  if (difficulty !== undefined) saveLocally('ms-restore-difficulty', difficulty)
  if (rows !== undefined) saveLocally('ms-restore-rows', rows)
  if (cols !== undefined) saveLocally('ms-restore-cols', cols)
  if (name !== undefined) saveLocally('ms-restore-name', name)
  if (email !== undefined) saveLocally('ms-restore-email', email)
  if (boardTime !== undefined) saveLocally('ms-restore-boardTime', boardTime)
  if (currentTime !== undefined) saveLocally('ms-restore-currentTime', currentTime)
  if (board !== undefined) saveLocally('ms-restore-board', board)
}

export const deleteSavedGame = () => {
  localStorage.removeItem('ms-restore-difficulty')
  localStorage.removeItem('ms-restore-rows')
  localStorage.removeItem('ms-restore-cols')
  localStorage.removeItem('ms-restore-name')
  localStorage.removeItem('ms-restore-email')
  localStorage.removeItem('ms-restore-boardTime')
  localStorage.removeItem('ms-restore-currentTime')
  localStorage.removeItem('ms-restore-board')
}

export const getSavedGame = () => {
  const savedBoard = getLocally('ms-restore-board')

  const board = savedBoard ? fromJS(savedBoard) : null

  return {
    board,
    boardTime: getLocally('ms-restore-boardTime'),
    currentTime: getLocally('ms-restore-currentTime'),
    name: getLocally('ms-restore-name'),
    email: getLocally('ms-restore-email'),
    rows: getLocally('ms-restore-rows'),
    cols: getLocally('ms-restore-cols'),
    difficulty: getLocally('ms-restore-difficulty'),
  }
}