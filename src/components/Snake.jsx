import { GiSnakeBite } from "react-icons/gi";

export default function Snake({
  snakeDots,
  direction,
  snakeColor = "#a3e635",
}) {
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
  const getBodyGradient = (color) => {
    // This function creates a gradient effect based on the chosen color
    // It's a simple way to create a 3D bubble effect with a single color input
    const lighterColor = adjustColor(color, 30);
    const darkerColor = adjustColor(color, -30);
    return `radial-gradient(circle, ${lighterColor}, ${darkerColor})`;
  };

  // Helper function to lighten or darken a hex color
  const adjustColor = (hex, percent) => {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    let RR =
      R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
    let GG =
      G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
    let BB =
      B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

    return `#${RR}${GG}${BB}`;
  };
  return (
    <>
      {snakeDots.map((dot, index) => {
        const isHead = index === 0;
        const isTail = index === snakeDots.length - 1;
        const bodyGradient = getBodyGradient(snakeColor);

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
                className=" text-2xl filter drop-shadow-lg"
                style={{
                  color: snakeColor,
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
                    background: bodyGradient,
                    width: isTail ? "70%" : "90%",
                    height: isTail ? "70%" : "90%",
                    transition: "width 0.2s, height 0.2s",
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
