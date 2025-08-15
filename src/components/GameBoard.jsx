import { useState, useEffect, useRef } from "react";
import Snake from "./Snake";
import Food, { FOOD_TYPES } from "./Food";
import { useInterval } from "../hooks/useInterval";

// We'll define the themes here for simplicity.
const themes = {
  default: "board-theme-default",
  garden: "board-theme-garden",
  road: "board-theme-road",
  space: "board-theme-space",
  cyberpunk: "board-theme-cyberpunk",
};

export default function GameBoard() {
  const boardSize = 20;
  const gridSize = 20;
  const initialSnake = [{ x: 8, y: 8 }];

  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(getRandomFood(initialSnake));
  const [foodType, setFoodType] = useState(FOOD_TYPES.NORMAL);
  const [direction, setDirection] = useState("RIGHT");
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const [selectedColor, setSelectedColor] = useState("#a3e635");
  const [currentTheme, setCurrentTheme] = useState("default");

  // Track remaining time for special food (ms)
  const [specialTimeLeft, setSpecialTimeLeft] = useState(null);

  // Timer refs
  const specialTimerRef = useRef(null);
  const specialIntervalRef = useRef(null);

  // --- Helpers ---
  function getRandomFood(snakeBody) {
    while (true) {
      const pos = {
        x: Math.floor(Math.random() * boardSize),
        y: Math.floor(Math.random() * boardSize),
      };
      const onSnake = snakeBody?.some((s) => s.x === pos.x && s.y === pos.y);
      if (!onSnake) return pos;
    }
  }

  function clearSpecialTimer() {
    if (specialTimerRef.current) {
      clearTimeout(specialTimerRef.current);
      specialTimerRef.current = null;
    }
    if (specialIntervalRef.current) {
      clearInterval(specialIntervalRef.current);
      specialIntervalRef.current = null;
    }
    setSpecialTimeLeft(null);
  }

  function startSpecialExpiryTimer(expiredType) {
    clearSpecialTimer();
    setSpecialTimeLeft(5000); // 5 seconds total

    // Countdown updater (100ms steps so blink can trigger at <= 800ms)
    specialIntervalRef.current = setInterval(() => {
      setSpecialTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 100) return 0;
        return prev - 100;
      });
    }, 100);

    // Expiry action
    specialTimerRef.current = setTimeout(() => {
      const nextType = pickNextTypeDifferentFrom(expiredType);
      spawnFood(nextType);
    }, 5000);
  }

  // 70% normal, 15% bonus, 15% bomb
  function pickWeightedType() {
    const r = Math.random();
    if (r < 0.7) return FOOD_TYPES.NORMAL;
    if (r < 0.85) return FOOD_TYPES.BONUS;
    return FOOD_TYPES.BOMB;
  }

  function pickNextTypeDifferentFrom(prevType) {
    if (prevType === FOOD_TYPES.BONUS || prevType === FOOD_TYPES.BOMB) {
      return FOOD_TYPES.NORMAL;
    }
    return pickWeightedType();
  }

  function spawnFood(type = FOOD_TYPES.NORMAL, nextSnake = snake) {
    const nextPos = getRandomFood(nextSnake);
    setFood(nextPos);
    setFoodType(type);

    if (type === FOOD_TYPES.BONUS || type === FOOD_TYPES.BOMB) {
      startSpecialExpiryTimer(type);
    } else {
      clearSpecialTimer();
    }
  }

  function moveSnake() {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    // Wall collision
    if (head.x < 0 || head.y < 0 || head.x >= boardSize || head.y >= boardSize) {
      endGame();
      return;
    }

    newSnake.unshift(head);

    // Self collision
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
      // Normal move: remove tail
      newSnake.pop();
    }

    setSnake(newSnake);
  }

  function endGame() {
    setGameOver(true);
    setSpeed(null);
    clearSpecialTimer();
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

  useEffect(() => {
    // Cleanup timers on unmount
    return () => clearSpecialTimer();
  }, []);

  function startNewGame() {
    clearSpecialTimer();
    const freshSnake = initialSnake;
    setSnake(freshSnake);
    setDirection("RIGHT");
    setSpeed(150);
    setGameOver(false);
    setScore(0);
    // Start with normal food (pulsating)
    spawnFood(FOOD_TYPES.NORMAL, freshSnake);
  }

  // Blink the last 0.8s of a special
  const shouldBlink =
    (foodType === FOOD_TYPES.BONUS || foodType === FOOD_TYPES.BOMB) &&
    specialTimeLeft !== null &&
    specialTimeLeft <= 800;

  // Theme backplate + optional blink class
  const foodClass = `food-${currentTheme} ${shouldBlink ? "food-blink" : ""}`;

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="flex items-center justify-between w-full max-w-md px-4">
        <h2 className="text-lg font-bold">Score: {score}</h2>
        <button
          onClick={startNewGame}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white font-mono uppercase transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-95"
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
        <Snake
          snakeDots={snake}
          direction={direction}
          snakeColor={selectedColor}
        />
        <Food position={food} type={foodType} extraClass={foodClass} />
      </div>

      {gameOver && (
        <div className="mt-4 text-red-500 text-4xl font-bold neon-text-red">
          Game Over!
        </div>
      )}
    </div>
  );
}