import React from "react";
import { hasFlags } from "./board-logic";
import { formatTimer } from "./Timer";

const difficulties = {
  0: "Easiest",
  1: "Easy",
  2: "Moderate",
  3: "Hard",
  4: "Hardest",
};

export const getLeaderboard = () => {
  const storedString = localStorage.getItem("ms-leaderboard") || "{}";

  try {
    return JSON.parse(storedString);
  } catch (e) {
    return {};
  }
};

const saveLeaderboardObject = (leaderboard) => {
  try {
    localStorage.setItem("ms-leaderboard", JSON.stringify(leaderboard));
  } catch (e) {
    console.error("unabled to save leaderboard to local storage:", e);
  }
};

/**
 * @param {number} time
 * @param {number} rows
 * @param {number} cols
 * @param {number} difficulty
 * @param {string} name
 *
 * @returns {void}
 */
export const saveToLeaderboard = (
  newTime,
  newRows,
  newCols,
  newDifficulty,
  name,
  board
) => {
  const leaderboard = getLeaderboard();
  const date = new Date().toISOString();
  const currentKey = `${newDifficulty}-${newRows}-${newCols}`;

  const noFlags = !hasFlags(board);

  const updatedExisting = Object.keys(leaderboard).some((key) => {
    if (!Array.isArray(leaderboard[key])) return false;

    const [difficulty, rows, cols] = key.split("-").map(Number);

    if (rows === newRows && cols === newCols && difficulty === newDifficulty) {
      leaderboard[key].push({ time: newTime, name, date });

      leaderboard[key] = leaderboard[key]
        .sort(({ time: a }, { time: b }) => a - b)
        .slice(0, 3);

      return true;
    }

    return false;
  });

  if (!updatedExisting) {
    leaderboard[currentKey] = [
      {
        time: newTime,
        name,
        date,
      },
    ];
  }

  const place =
    leaderboard[currentKey]?.findIndex(({ date: d }) => d === date) ?? -1;

  saveLeaderboardObject(leaderboard);

  return leaderboard;
};

export const Leaderboard = ({ leaderboard, chooseGame }) => {
  return (
    <section>
      <h2 style={{ textAlign: "center" }}>Leaderboard</h2>
      {Object.keys(leaderboard)
        .sort()
        .map((key) => {
          const [difficulty, rows, cols] = key.split("-").map(Number);

          return (
            <ul
              style={{ listStyle: "none", padding: 0, textAlign: "center" }}
              key={key}
            >
              <h3
                className="leaderboard-group-heading"
                onClick={(e) => chooseGame(rows, cols, difficulty)}
              >
                {difficulties[difficulty]}: {rows} x {cols}
              </h3>
              {leaderboard[key].map((record, i) => (
                <li className="record-item" key={i}>
                  <span className="record-time">
                    {formatTimer(record.time)}
                  </span>{" "}
                  <span style={{ fontWeight: "bolder" }}>{record.name}</span>{" "}
                  {new Date(record.date).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </li>
              ))}
            </ul>
          );
        })}
    </section>
  );
};
