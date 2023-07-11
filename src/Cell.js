import React, { useState, useRef } from "react";

const scheme = {
  1: "blue",
  2: "darkgreen",
  3: "red",
  4: "darkblue",
  5: "maroon",
  6: "turquoise",
  7: "black",
  8: "gray",
};

export const Cell = ({ cell, onClick, onContextMenu }) => {
  const timerRef = useRef(null);
  const rightClickRef = useRef();
  const [flaggedOnMouseDown, setFlaggedOnMouseDown] = useState(false);

  rightClickRef.current = onContextMenu;

  const touchStart = (e) => {
    e.preventDefault();
    e.persist();

    setFlaggedOnMouseDown(cell.get("flagged"));

    function leaveListener(event) {
      clearTimeout(timerRef.current);
      timerRef.current = null;

      e.target.removeEventListener("mouseleave", leaveListener);
    }

    e.target.addEventListener("mouseleave", leaveListener);

    const newTimer = setTimeout(() => {
      rightClickRef.current(e);
      window.navigator.vibrate(10);

      timerRef.current = null;
      e.target.removeEventListener("mouseleave", leaveListener);
    }, 500);

    timerRef.current = newTimer;
  };

  const handleClick = (e) => {
    if (flaggedOnMouseDown) {
      return setFlaggedOnMouseDown(false);
    }

    onClick(e);
  };

  const cleanUp = (e) => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const flagged = cell.get("flagged");
  const show = cell.get("show");
  const number = cell.get("number");

  const cellValue = `${number || ""}`;

  return (
    <div
      className={`cell ${show ? "open-cell" : "closed-cell"}`}
      style={{ color: scheme[number] || "black" }}
      onClick={handleClick}
      onContextMenu={onContextMenu}
      onTouchStart={touchStart}
      onMouseDown={touchStart}
      onTouchEnd={cleanUp}
      onTouchCancel={cleanUp}
      onMouseUp={cleanUp}
    >
      {flagged ? "🚩" : show ? cellValue : ""}
    </div>
  );
};
