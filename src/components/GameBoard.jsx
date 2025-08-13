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

  const [selectedColor, setSelectedColor] = useState("#a3e635");

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
      setSpeed((prevSpeed) => {
        if (prevSpeed > 50) {
          // Keep a minimum speed to prevent it from getting too fast
          return prevSpeed - 5;
        }
        return prevSpeed;
      });
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
    <div className="flex flex-col items-center justify-center  bg-gray-950 text-white mt-4 rounded-lg">
      <div className="flex items-center justify-between w-full  px-4 mb-8 mt-4">
        <h2 className="text-2xl font-bold font-mono neon-text">
          Score: {score}
        </h2>
        <button
          onClick={startNewGame}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white font-mono uppercase transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-95"
        >
          {gameOver || speed === null ? "Start" : "Restart"}
        </button>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <label htmlFor="snake-color" className="text-lg font-mono neon-text">
          Snake Color:
        </label>
        <input
          type="color"
          id="snake-color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-12 h-12 rounded-full cursor-pointer border-none"
        />
      </div>

      <div
        className="relative board-theme"
        style={{
          width: `${boardSize * gridSize}px`,
          height: `${boardSize * gridSize}px`,
        }}
      >
        <Snake
          snakeDots={snake}
          direction={direction}
          snakeColor={selectedColor}
        />
        <Food position={food} />
      </div>

      {gameOver && (
        <div className="mt-4 text-red-500 text-4xl font-bold neon-text-red">
          Game Over!
        </div>
      )}
    </div>
  );
}
