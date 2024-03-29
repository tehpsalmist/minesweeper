import React, { useState, useEffect, useRef } from "react";
import "@babel/polyfill";
import { useInterval, useRememberedState } from "./hooks";
import { Cell } from "./Cell";
import {
  generateBoard,
  updateBoard,
  boardCleared,
  getPercentComplete,
  isSameCell,
} from "./board-logic";
import { Timer } from "./Timer";
import { saveToLeaderboard, Leaderboard, getLeaderboard } from "./leaderboard";
import { deleteSavedGame, getSavedGame, saveGame } from "./save-game";

export const Minesweeper = (props) => {
  const [name, setName] = useRememberedState("ms-player-name", "Anonymous");
  const [email, setEmail] = useRememberedState(
    "ms-player-email",
    "me@example.com"
  );
  const [phone, setPhone] = useRememberedState("ms-player-phone", "");

  const [difficulty, setDifficulty] = useRememberedState("ms-difficulty", 0);

  const [rows, setRows] = useRememberedState("ms-rows", 10);
  const [cols, setCols] = useRememberedState("ms-cols", 10);
  const [board, setBoard] = useState(() =>
    generateBoard(difficulty, rows, cols)
  );

  const [gameStarted, setGameStarted] = useState(false);
  const [playerAlive, setPlayerAlive] = useState(true);
  const [hasWon, setHasWon] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [timer, setTimer] = useState(0);

  const [restoreTime, setRestoreTime] = useState(0);

  const [leaderboard, setLeaderboard] = useState(() => getLeaderboard());

  const reset = (r = rows, c = cols, d = difficulty) => {
    setBoard(generateBoard(d, r, c));
    setHasWon(false);
    setPlayerAlive(true);
    setGameStarted(false);
    setTimer(0);
  };

  const gameover = (clickedCell) => {
    setPlayerAlive(false);
    setGameStarted(false);
    setBoard(
      board.map((row) =>
        row.map((cell) => {
          return cell
            .set("show", true)
            .update("number", (val) => {
              if (cell.get("isBomb")) {
                return cell.get("flagged")
                  ? "🚩"
                  : isSameCell(clickedCell, cell)
                  ? "💥"
                  : "💣";
              }

              return cell.get("flagged") ? "🚫" : val;
            })
            .set("flagged", false);
        })
      )
    );

    deleteSavedGame();
  };

  const restoreGame = () => {
    const {
      board: savedBoard,
      currentTime: time,
      boardTime,
      difficulty: savedDifficulty,
      name: savedName,
      email: savedEmail,
      rows: savedRows,
      cols: savedCols,
    } = getSavedGame();

    const boardPauseTime = Number(boardTime);

    if (!savedBoard) return;

    setRows(savedRows);
    setCols(savedCols);
    setName(savedName);
    setEmail(savedEmail);
    setBoard(savedBoard);
    setDifficulty(savedDifficulty);
    setPlayerAlive(true);
    setHasWon(false);
    setGameStarted(true);
    setTimer(time);
    setStartTime(Date.now() - time * 1000);
  };

  const cellClicked = (cell) => (e) => {
    e.preventDefault();

    if (!gameStarted && !hasWon && playerAlive && cell.get("isBomb")) {
      const generateSafeBoard = (r, c) => {
        const newBoard = generateBoard(difficulty, rows, cols);

        if (newBoard.get(r).get(c).get("isBomb")) {
          return generateSafeBoard(r, c);
        }

        return newBoard;
      };

      const safeBoard = generateSafeBoard(cell.get("row"), cell.get("col"));
      const newCell = safeBoard.get(cell.get("row")).get(cell.get("col"));

      return setBoard(updateBoard(safeBoard, newCell));
    }

    if (playerAlive && !hasWon && !cell.get("flagged") && !cell.get("show")) {
      if (cell.get("isBomb")) {
        return gameover(cell);
      }

      if (!gameStarted) {
        saveGame({ name, email, difficulty, rows, cols });
        setStartTime(Date.now());
        setGameStarted(true);
      }

      setBoard(updateBoard(board, cell));
    }
  };

  const cellFlagged = (cell) => (e) => {
    e.preventDefault();

    if (playerAlive && !hasWon && !cell.get("show") && gameStarted) {
      setBoard(
        board.updateIn(
          [cell.get("row"), cell.get("col"), "flagged"],
          (val) => !val
        )
      );
    }
  };

  useEffect(() => {
    if (playerAlive && boardCleared(board)) {
      deleteSavedGame();
      setGameStarted(false);
      setLeaderboard(
        saveToLeaderboard(
          timer,
          board.size,
          board.get(0).size,
          difficulty,
          name,
          board
        )
      );
      return setHasWon(true);
    }

    if (gameStarted) {
      saveGame({ board, boardTime: Date.now() });
    }
  }, [board]);

  useEffect(() => {
    const { boardTime } = getSavedGame();

    setRestoreTime(boardTime && new Date(Number(boardTime)).toLocaleString());
  }, [gameStarted]);

  useInterval(() => {
    const currentTime = Math.floor((Date.now() - startTime) / 1000);

    setTimer(currentTime);
    saveGame({ currentTime });
  }, gameStarted && 1000);

  return (
    <main className="board">
      <h1 style={{ textAlign: "center" }}>
        <pre>minesweeper</pre>
      </h1>
      <div className="name-difficulty">
        <div className="user-info">
          <label className="name-label">
            Challenger's Name:
            <input
              className="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="email-label">
            Challenger's Email:
            <input
              className="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="phone-label">
            Challenger's Phone:
            <input
              className="phone-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        </div>
        <label htmlFor="difficulty">Difficulty:</label>
        <div>
          Easy
          <input
            id="difficulty"
            type="range"
            min={0}
            max={4}
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            disabled={gameStarted}
          />
          Hard
        </div>
      </div>
      <div className="rows-columns">
        <label htmlFor="rows">
          Rows:{" "}
          <input
            id="rows"
            type="number"
            max={100}
            min={10}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            disabled={gameStarted}
          />
        </label>
        <label htmlFor="cols">
          Columns:{" "}
          <input
            id="cols"
            type="number"
            max={100}
            min={10}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            disabled={gameStarted}
          />
        </label>
      </div>
      <h2 className="smiley-row">
        <button className="smiley" onClick={(e) => reset()}>
          {hasWon ? "😎" : playerAlive ? "🙂" : "😵"}
        </button>
      </h2>
      <Timer seconds={timer} />
      <div className="board-wrapper">
        <div style={{ width: `${board.get(0).count() * 42}px` }}>
          {board.map((row, index, arr) => (
            <div
              key={index}
              style={{
                display: "flex",
                borderTop: index === 0 ? "3px solid black" : undefined,
                borderLeft: "3px solid black",
                borderRight: "3px solid black",
                borderBottom:
                  index === arr.size - 1 ? "3px solid black" : undefined,
              }}
            >
              {row.map((cell, i) => (
                <Cell
                  key={i}
                  cell={cell}
                  onClick={cellClicked(cell)}
                  onContextMenu={cellFlagged(cell)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {restoreTime && !gameStarted && (
        <button
          className="restore-button"
          type="button"
          onClick={(e) => restoreGame()}
        >
          Restore Game from: {restoreTime}
        </button>
      )}
      <Leaderboard leaderboard={leaderboard} chooseGame={reset} />
    </main>
  );
};
