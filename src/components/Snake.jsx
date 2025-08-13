import { GiSnakeBite } from "react-icons/gi";

export default function Snake({ snakeDots, direction }) {
  const gridSize = 20;

  // Determines the rotation angle for the snake's head based on its direction
  const getHeadRotation = () => {
    switch (direction) {
      case "UP":
        return "-90deg";
      case "DOWN":
        return "90deg";
      case "LEFT":
        return "180deg";
      case "RIGHT":
        return "0deg";
      default:
        return "0deg"; // Default orientation
    }
  };

  return (
    <>
      {snakeDots.map((dot, index) => {
        const isHead = index === 0;
        const isTail = index === snakeDots.length - 1;

        return (
          <div
            key={index}
            className="absolute flex items-center justify-center"
            style={{
              left: `${dot.x * gridSize}px`,
              top: `${dot.y * gridSize}px`,
              width: `${gridSize}px`,
              height: `${gridSize}px`,
              // Adds a smooth transition for movement instead of instant jumps
              transition: "all 0.1s linear",
            }}
          >
            {isHead ? (
              // 🐍 Head Segment
              <span
                role="img"
                aria-label="snake-head"
                className="text-lime-300 text-2xl filter drop-shadow-lg"
                style={{
                  transform: `rotate(${getHeadRotation()})`,
                  transition: "transform 0.1s linear", // Smooth rotation
                }}
              >
                <GiSnakeBite />
              </span>
            ) : (
              // 🟢 Body & Tail Segment
              <div className="flex items-center justify-center w-full h-full">
                <div
                  className="rounded-full filter drop-shadow-md"
                  style={{
                    // Radial gradient gives a nice 3D, bubble-like effect
                    background: "radial-gradient(circle, #a3e635, #4d7c0f)", // from lime-400 to green-700
                    // The tail is smaller than the body segments
                    width: isTail ? "70%" : "90%",
                    height: isTail ? "70%" : "90%",
                    transition: "width 0.2s, height 0.2s", // Animate size change when a new tail is formed
                  }}
                ></div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
