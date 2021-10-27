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

export const generateBoard = (difficulty = 0, rows = 10, cols = 10) => {
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

export const updateBoard = (board, cell) => {
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

export const boardCleared = board => board.flatten(true).every(cell => cell.get('isBomb') || cell.get('show'))

export const hasFlags = board => board.flatten(true).some(cell => cell.get('flagged'))

export const getPercentComplete = board => {
  const { complete, total } = board.flatten(true).reduce(({ complete, total }, cell) => {
    return {
      complete: cell.get('show') ? complete + 1 : complete,
      total: total + 1
    }
  },{ complete: 0, total: 0 })

  return ((complete / total) * 100).toFixed(2)
}

export const isSameCell = (one, other) => one.get('row') === other.get('row') && one.get('col') === other.get('col')
