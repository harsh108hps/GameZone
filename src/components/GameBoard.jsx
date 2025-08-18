import { useState, useEffect, useRef } from "react";
import Snake from "./Snake";
import Food, { FOOD_TYPES } from "./Food";
import Leaderboard from "./Leaderboard";
import { useInterval } from "../hooks/useInterval";

// We'll define the themes here for simplicity.
const themes = {
  default: "board-theme-default",
  garden: "board-theme-garden",
  road: "board-theme-road",
  space: "board-theme-space",
  cyberpunk: "board-theme-cyberpunk",
};

// Levels hurdles (instead of speed)
const levelHurdles = {
  1: [], // no obstacles
  2: [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ],
  3: [
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 7, y: 5 },
    { x: 12, y: 15 },
    { x: 13, y: 15 },
    { x: 14, y: 15 },
  ],
  4: [
    ...Array.from({ length: 8 }, (_, i) => ({ x: i + 6, y: 10 })),
    ...Array.from({ length: 8 }, (_, i) => ({ x: 10, y: i + 6 })),
  ],
  5: [
    // Horizontal line with gaps at x=5 and x=15
    ...Array.from({ length: 20 }, (_, i) =>
      i === 5 || i === 15 ? null : { x: i, y: 10 }
    ).filter(Boolean),

    // Vertical line with gaps at y=5 and y=15
    ...Array.from({ length: 20 }, (_, i) =>
      i === 5 || i === 15 ? null : { x: 10, y: i }
    ).filter(Boolean),
  ],
};

export default function GameBoard() {
  const boardSize = 20;
  const gridSize = 20;
  const initialSnake = [{ x: 0, y: 0 }]; // snake starts at top-left corner

  const [snake, setSnake] = useState(initialSnake);
  const [hurdles, setHurdles] = useState(levelHurdles[1]);
  const [food, setFood] = useState(getRandomFood(initialSnake, levelHurdles[1]));
  const [foodType, setFoodType] = useState(FOOD_TYPES.NORMAL);
  const [direction, setDirection] = useState("RIGHT");
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const [selectedColor, setSelectedColor] = useState("#a3e635");
  const [currentTheme, setCurrentTheme] = useState("default");
  const [currentLevel, setCurrentLevel] = useState(1);

  // 🏆 Leaderboard + High Score
  const [leaderboard, setLeaderboard] = useState([]);
  const [highestScore, setHighestScore] = useState(0);

  // 👤 Player Name + Modal
  const [playerName, setPlayerName] = useState("");
  const [showNameModal, setShowNameModal] = useState(true);
  const [tempName, setTempName] = useState("");
  const [editingName, setEditingName] = useState(false); // NEW: for inline edit
  const [paused, setPaused] = useState(false);
  // 🎉 High score banner (non-blocking)
  const [showHighBanner, setShowHighBanner] = useState(false);

  // Track remaining time for special food (ms)
  const [specialTimeLeft, setSpecialTimeLeft] = useState(null);

  // Timer refs
  const specialTimerRef = useRef(null);
  const specialIntervalRef = useRef(null);

  // --- Helpers ---
  function getRandomFood(snakeBody, hurdlesList) {
    while (true) {
      const pos = {
        x: Math.floor(Math.random() * boardSize),
        y: Math.floor(Math.random() * boardSize),
      };
      const onSnake = snakeBody?.some((s) => s.x === pos.x && s.y === pos.y);
      const onHurdle = hurdlesList?.some((h) => h.x === pos.x && h.y === pos.y);
      if (!onSnake && !onHurdle) return pos;
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

    // Countdown updater
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
    const nextPos = getRandomFood(nextSnake, hurdles);
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

    // Hurdle collision
    if (hurdles.some((h) => h.x === head.x && h.y === head.y)) {
      endGame();
      return;
    }

    // Move head
    newSnake.unshift(head);

    // Self collision
    for (let i = 1; i < newSnake.length; i++) {
      if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
        endGame();
        return;
      }
    }

    const ateFood = head.x === food.x && head.y === food.y;

    if (ateFood) {
      // Update score based on food type
      setScore((prev) => {
        if (foodType === FOOD_TYPES.NORMAL) return prev + 1;
        if (foodType === FOOD_TYPES.BONUS) return prev + 5;
        if (foodType === FOOD_TYPES.BOMB) return Math.floor(prev / 2);
        return prev;
      });

      // DO NOT unshift again (we already did). Growing = just don't pop the tail.
      // Spawn next food
      clearSpecialTimer();
      const nextType = pickWeightedType();
      spawnFood(nextType, newSnake);
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

    const prevHigh = highestScore;
    const existing = leaderboard.find((p) => p.name === playerName);
    const bestForPlayer = existing ? Math.max(existing.score, score) : score;
    const newHigh = Math.max(prevHigh, bestForPlayer);

    // Update leaderboard
    setLeaderboard((prevLb) => {
      const updated = [...prevLb, { name: playerName || "Player", score }];
      const sorted = updated.sort((a, b) => b.score - a.score);

      // 📝 Save leaderboard in localStorage
      localStorage.setItem("leaderboard", JSON.stringify(sorted));
      return sorted;
    });

    // Update high score
    if (newHigh > prevHigh) {
      setHighestScore(newHigh);
      localStorage.setItem("highestScore", newHigh); // 📝 Save high score
      setShowHighBanner(true);
      setTimeout(() => setShowHighBanner(false), 2500);
    }
  }

  useInterval(moveSnake, paused ? null : speed);

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp" && direction !== "DOWN") setDirection("UP");
    if (e.key === "ArrowDown" && direction !== "UP") setDirection("DOWN");
    if (e.key === "ArrowLeft" && direction !== "RIGHT") setDirection("LEFT");
    if (e.key === "ArrowRight" && direction !== "LEFT") setDirection("RIGHT");

    if (e.code === "Space") {
      e.preventDefault(); // prevent page scroll
      setPaused((prev) => !prev);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [direction, paused]); // ✅ include paused here

  useEffect(() => {
    setHurdles(levelHurdles[currentLevel]);
  }, [currentLevel]);

  useEffect(() => {
    return () => clearSpecialTimer();
  }, []);

  function startNewGame() {
    clearSpecialTimer();
    const freshSnake = [{ x: 0, y: 0 }];
    setSnake(freshSnake);
    setDirection("RIGHT");
    setPaused(false); 
    setSpeed(200);
    setGameOver(false);
    setScore(0);
    setHurdles(levelHurdles[currentLevel]);
    spawnFood(FOOD_TYPES.NORMAL, freshSnake);
  }

  const shouldBlink =
    (foodType === FOOD_TYPES.BONUS || foodType === FOOD_TYPES.BOMB) &&
    specialTimeLeft !== null &&
    specialTimeLeft <= 800;

  const foodClass = `food-${currentTheme} ${shouldBlink ? "food-blink" : ""}`;

  // 👤 Name Modal submit
  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = (tempName || "").trim();
    const finalName = trimmed || "Player";
    setPlayerName(finalName);
    setShowNameModal(false);
    // Auto-start once the name is set, if not running
    if (speed === null || gameOver) startNewGame();
  };

  const handleInlineNameSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
      setEditingName(false);
    }
  };

  // Prevent playing without a name (optional safety)
  useEffect(() => {
    if (!playerName && !showNameModal) setShowNameModal(true);
  }, [playerName, showNameModal]);

  useEffect(() => {
    const savedLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const savedHighScore = parseInt(localStorage.getItem("highestScore")) || 0;
    setLeaderboard(savedLeaderboard);
    setHighestScore(savedHighScore);
  }, []);
  return (
    <div className="w-full bg-gray-950 text-white mt-4 rounded-lg p-6">
      {/* Non-blocking high-score banner */}
      {showHighBanner && (
        <div className="fixed top-6 right-6 z-50 bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg shadow-lg">
          🏆 New Highest Score!
        </div>
      )}

      {/* Two-column layout: Game (left) + Leaderboard (right) */}
      <div className="mx-auto max-w-6xl flex items-start gap-6">
        {/* LEFT: game + controls */}
        <div className="flex-1 flex flex-col items-center">
          {/* Top bar */}
          <div className="flex items-center justify-between w-full max-w-lg px-4 mb-8 mt-2">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold font-mono neon-text flex items-center gap-2">
                Player:{" "}
                {editingName ? (
                  <form onSubmit={handleInlineNameSubmit}>
                    <input
                      autoFocus
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={handleInlineNameSubmit}
                      className="bg-gray-800 text-white px-2 py-1 rounded"
                    />
                  </form>
                ) : (
                  <span
                    onClick={() => {
                      setEditingName(true);
                      setTempName(playerName);
                    }}
                    className="cursor-pointer underline hover:text-purple-400"
                    title="Click to edit name"
                  >
                    {playerName || "—"}
                  </span>
                )}
              </h2>
              <p className="text-lg font-mono text-gray-300">Score: {score}</p>
            </div>
            {/* Start/Restart Button */}
            <button
              onClick={startNewGame}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white font-mono uppercase transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-95"
            >
              {gameOver || speed === null ? "Start" : "Restart"}
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="snake-color" className="text-lg font-mono neon-text">
                Snake Color:
              </label>
              <input
                type="color"
                id="snake-color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-10 h-10 rounded-full cursor-pointer border-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="board-theme" className="text-lg font-mono neon-text">
                Theme:
              </label>
              <select
                id="board-theme"
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="bg-gray-800 text-white rounded-md p-2"
              >
                {Object.keys(themes).map((themeName) => (
                  <option key={themeName} value={themeName}>
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="game-level" className="text-lg font-mono neon-text">
                Level:
              </label>
              <select
                id="game-level"
                value={currentLevel}
                onChange={(e) => setCurrentLevel(Number(e.target.value))}
                className="bg-gray-800 text-white rounded-md p-2"
              >
                {Object.keys(levelHurdles).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Board */}
          <div
            className={`relative board-theme ${themes[currentTheme]}`}
            style={{
              width: `${boardSize * gridSize}px`,
              height: `${boardSize * gridSize}px`,
            }}
          >
            {/* Snake */}
            <Snake snakeDots={snake} direction={direction} snakeColor={selectedColor} />

            {/* Food */}
            <Food position={food} type={foodType} extraClass={foodClass} />

            {/* Hurdles */}
            {hurdles.map((h, idx) => (
              <div
                key={idx}
                className="absolute bg-purple-700 border border-purple-500 rounded"
                style={{
                  left: h.x * gridSize,
                  top: h.y * gridSize,
                  width: gridSize,
                  height: gridSize,
                }}
              />
            ))}
          </div>
          {paused && !gameOver && (
  <div className="mt-4 text-yellow-400 text-3xl font-bold neon-text">
    ⏸ Paused
  </div>
)}
          {gameOver && (
            <div className="mt-4 text-red-500 text-4xl font-bold neon-text-red">
              Game Over!
            </div>
          )}
        </div>

        {/* RIGHT: Leaderboard */}
        <Leaderboard leaderboard={leaderboard} highestScore={highestScore} />
      </div>

      {/* 👤 Centered name modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <form
            onSubmit={handleNameSubmit}
            className="bg-gray-800 w-80 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-xl font-bold text-center mb-4">Enter your name</h3>
            <input
              autoFocus
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Start Game
            </button>
          </form>
        </div>
      )}
    </div>
  );
}