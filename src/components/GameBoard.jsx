import { useState, useEffect } from "react";
import Snake from "./Snake";
import Food from "./Food";
import { useInterval } from "../hooks/useInterval";

export default function GameBoard() {
  const boardSize = 20;
  const gridSize = 20;

  const initialSnake = [{ x: 8, y: 8 }];

  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(getRandomFood());
  const [direction, setDirection] = useState("RIGHT");
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  function getRandomFood() {
    return {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
  }

  function moveSnake() {
    const newSnake = [...snake];
    const head = { ...newSnake[0] }; // head at index 0

    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    // Wall collision
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= boardSize ||
      head.y >= boardSize
    ) {
      endGame();
      return;
    }

    // Add new head
    newSnake.unshift(head);

    // Self collision check (head vs rest of body)
    for (let i = 1; i < newSnake.length; i++) {
      if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
        endGame();
        return;
      }
    }

    // Eat food
    if (head.x === food.x && head.y === food.y) {
      setFood(getRandomFood());
      setScore((prev) => prev + 1);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }

  function endGame() {
    setGameOver(true);
    setSpeed(null);
  }

  useInterval(moveSnake, speed);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" && direction !== "DOWN") setDirection("UP");
      if (e.key === "ArrowDown" && direction !== "UP") setDirection("DOWN");
      if (e.key === "ArrowLeft" && direction !== "RIGHT") setDirection("LEFT");
      if (e.key === "ArrowRight" && direction !== "LEFT") setDirection("RIGHT");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  function startNewGame() {
    setSnake(initialSnake);
    setFood(getRandomFood());
    setDirection("RIGHT");
    setSpeed(150);
    setGameOver(false);
    setScore(0);
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="flex items-center justify-between w-full max-w-md px-4">
        <h2 className="text-lg font-bold">Score: {score}</h2>
        <button
          onClick={startNewGame}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded text-white"
        >
          {gameOver || speed === null ? "Start" : "Restart"}
        </button>
      </div>

      <div
        className="relative border-4 border-gray-700 bg-black mt-4"
        style={{
          width: `${boardSize * gridSize}px`,
          height: `${boardSize * gridSize}px`,
        }}
      >
        <Snake snakeDots={snake} direction={direction} />
        <Food position={food} />
      </div>

      {gameOver && (
        <div className="mt-4 text-red-500 text-xl font-bold">Game Over!</div>
      )}
    </div>
  );
}
