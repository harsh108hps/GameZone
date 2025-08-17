import { GiShinyApple, GiRollingBomb } from "react-icons/gi";
import { PiOrangeFill } from "react-icons/pi";
import { IoDiamondSharp } from "react-icons/io5";


export const FOOD_TYPES = {
  NORMAL: "normal",
  BONUS: "bonus",
  BOMB: "bomb",
};

const ICONS = {
  [FOOD_TYPES.NORMAL]: PiOrangeFill,
  [FOOD_TYPES.BONUS]: IoDiamondSharp,
  [FOOD_TYPES.BOMB]: GiRollingBomb,
};

/**
 * Distinct icon colors that never blend with the board.
 * The themed backplate (from index.css) ensures extra contrast.
 */
const COLORS = {
  [FOOD_TYPES.NORMAL]: "#f97316", // orange-500
  [FOOD_TYPES.BONUS]: "#ef4444", // red-500
  [FOOD_TYPES.BOMB]: "#0f172a", // slate-900 (near-black)
};

export default function Food({
  position,
  type = FOOD_TYPES.NORMAL,
  extraClass = "", // receives "food-<theme>" and optional "food-blink"
}) {
  const gridSize = 20;
  const Icon = ICONS[type];

  return (
    <div
      className={`absolute rounded-full flex items-center justify-center ${
        type === FOOD_TYPES.NORMAL ? "food-pulsate" : ""
      } ${extraClass}`}
      style={{
        left: `${position.x * gridSize}px`,
        top: `${position.y * gridSize}px`,
        width: `${gridSize}px`,
        height: `${gridSize}px`,
      }}
      aria-label={`food-${type}`}
    >
      {/* Icon sits on a themed backplate so it stays visible on any board */}
      <Icon
        size={gridSize - 2}
        style={{
          color: COLORS[type],
          filter:
            type === FOOD_TYPES.BOMB
              ? "drop-shadow(0 0 4px rgba(0,0,0,0.8))"
              : "drop-shadow(0 0 6px rgba(239,68,68,0.6))",
        }}
      />
    </div>
  );
}