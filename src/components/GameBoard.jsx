import { useState, useEffect, useRef } from "react";
import Snake from "./Snake";
import Food from "./Food";
import { useInterval } from "../hooks/useInterval";

export default function GameBoard() {
  const boardSize = 20;
  const gridSize = 20;
  const initialSnake = [{ x: 8, y: 8 }];
  const initialSpeed = 150;

  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(() => getRandomFood(initialSnake));
  const [direction, setDirection] = useState("RIGHT");
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Refs for snake and timers
  const snakeRef = useRef(snake);
  const foodTimerRef = useRef(null);
  const remainingTimeRef = useRef(null);
  const foodSpawnTimeRef = useRef(null);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  // Board & wall colors
  const boardShades = [
    "#9ca3af", "#6b7280", "#4b5563", "#374151",
    "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"
  ];
  const [boardColor] = useState(
    boardShades[Math.floor(Math.random() * boardShades.length)]
  );

  // Generate wall cells & random colors
  const wallCells = [];
  for (let i = 0; i < boardSize; i++) {
    wallCells.push({ x: i, y: 0 });
    wallCells.push({ x: i, y: boardSize - 1 });
    wallCells.push({ x: 0, y: i });
    wallCells.push({ x: boardSize - 1, y: i });
  }
  const wallShades = wallCells.map(() => {
    const shades = boardShades.filter(c => c !== boardColor);
    return shades[Math.floor(Math.random() * shades.length)];
  });

  function getRandomFood(snakeBody) {
    const foodTypes = ["normal", "bonus", "poison"];
    const randomType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * (boardSize - 2)) + 1,
        y: Math.floor(Math.random() * (boardSize - 2)) + 1,
        type: randomType,
      };
    } while (snakeBody.some(dot => dot.x === newFood.x && dot.y === newFood.y));
    return newFood;
  }

  function moveSnake() {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    // Wall collision
    if (
      head.x === 0 ||
      head.y === 0 ||
      head.x === boardSize - 1 ||
      head.y === boardSize - 1
    ) {
      endGame();
      return;
    }

    newSnake.unshift(head);

    // Self collision
    if (newSnake.slice(1).some(dot => dot.x === head.x && dot.y === head.y)) {
      endGame();
      return;
    }

    // Eat food
    if (head.x === food.x && head.y === food.y) {
      if (food.type === "normal") {
        setScore(prev => prev + 1);
        setSpeed(prev => Math.max(50, prev - 10));
      } else if (food.type === "bonus") {
        setScore(prev => prev + 5);
        setSpeed(prev => Math.max(50, prev - 20));
      } else if (food.type === "poison") {
        setScore(prev => Math.floor(prev / 2));
        setSnake(prev => prev.slice(0, Math.ceil(prev.length / 2)));
      }
      setFood(getRandomFood(newSnake));
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }

  function endGame() {
    setGameOver(true);
    setSpeed(null);
    setPaused(false);
    clearTimeout(foodTimerRef.current);
  }

  useInterval(moveSnake, speed);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        if (gameOver) {
          startNewGame();
        } else if (speed) {
          setPaused(true);
          setSpeed(null);
        } else if (paused) {
          startCountdown();
        }
      }

      const startIfStopped = () => {
        if (!speed && !gameOver && !paused) startCountdown();
      };

      if (e.key === "ArrowUp" && direction !== "DOWN") {
        setDirection("UP");
        startIfStopped();
      }
      if (e.key === "ArrowDown" && direction !== "UP") {
        setDirection("DOWN");
        startIfStopped();
      }
      if (e.key === "ArrowLeft" && direction !== "RIGHT") {
        setDirection("LEFT");
        startIfStopped();
      }
      if (e.key === "ArrowRight" && direction !== "LEFT") {
        setDirection("RIGHT");
        startIfStopped();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, speed, gameOver, paused]);

  // Pause-aware auto-despawn for bonus & poison
  useEffect(() => {
    clearTimeout(foodTimerRef.current);

    if (food.type === "bonus" || food.type === "poison") {
      const timeout = food.type === "poison" ? 3000 : 5000;
      remainingTimeRef.current = timeout;
      foodSpawnTimeRef.current = Date.now();

      if (!paused) {
        foodTimerRef.current = setTimeout(() => {
          setFood(getRandomFood(snakeRef.current));
        }, timeout);
      }
    }
  }, [food]);

  // Handle pause/resume for food timers
  useEffect(() => {
    if (paused) {
      if (remainingTimeRef.current != null && foodSpawnTimeRef.current != null) {
        const elapsed = Date.now() - foodSpawnTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        clearTimeout(foodTimerRef.current);
      }
    } else {
      if (
        remainingTimeRef.current != null &&
        remainingTimeRef.current > 0 &&
        (food.type === "bonus" || food.type === "poison")
      ) {
        foodSpawnTimeRef.current = Date.now();
        foodTimerRef.current = setTimeout(() => {
          setFood(getRandomFood(snakeRef.current));
        }, remainingTimeRef.current);
      }
    }
  }, [paused]);

  function startNewGame() {
    setSnake(initialSnake);
    setFood(getRandomFood(initialSnake));
    setDirection("RIGHT");
    setScore(0);
    setGameOver(false);
    setPaused(false);
    startCountdown();
  }

  function startCountdown() {
    setPaused(false);
    let counter = 3;
    setCountdown(counter);
    const timer = setInterval(() => {
      counter--;
      if (counter === 0) {
        setCountdown("Go!");
        setTimeout(() => {
          setCountdown(null);
          setSpeed(initialSpeed);
        }, 500);
        clearInterval(timer);
      } else {
        setCountdown(counter);
      }
    }, 1000);
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
        className="relative mt-4 flex items-center justify-center"
        style={{
          backgroundColor: boardColor,
          width: `${boardSize * gridSize}px`,
          height: `${boardSize * gridSize}px`,
        }}
      >
        {/* Pause overlay */}
        {paused && !gameOver && !countdown && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
               style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
            <span className="text-white text-3xl font-bold">Paused</span>
          </div>
        )}

        {/* Countdown overlay */}
        {countdown && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
               style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <span className="text-white text-4xl font-bold">{countdown}</span>
          </div>
        )}

        {/* Walls */}
        {wallCells.map((cell, idx) => (
          <div
            key={`wall-${cell.x}-${cell.y}`}
            style={{
              position: "absolute",
              left: `${cell.x * gridSize}px`,
              top: `${cell.y * gridSize}px`,
              width: `${gridSize}px`,
              height: `${gridSize}px`,
              backgroundColor: wallShades[idx],
            }}
          ></div>
        ))}

        {/* Snake & Food */}
        <Snake snakeDots={snake} direction={direction} prefix="snake" />
        <Food position={food} type={food.type} prefix="food" />
      </div>

      {gameOver && (
        <div className="mt-4 text-red-500 text-xl font-bold">Game Over!</div>
      )}
    </div>
  );
}