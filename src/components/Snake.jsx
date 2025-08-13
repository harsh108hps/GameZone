import { GiSnakeBite } from "react-icons/gi";
export default function Snake({ snakeDots }) {
  const gridSize = 20;
  return (
    <>
      {snakeDots.map((dot, index) => (
        <div
          key={index}
          className="absolute flex items-center justify-center text-lg font-bold"
          style={{
            left: `${dot.x * gridSize}px`,
            top: `${dot.y * gridSize}px`,
            width: `${gridSize}px`,
            height: `${gridSize}px`,
          }}
        >
          {index === 0 ? (
            <span role="img" aria-label="snake-head" className="text-green-400">
              <GiSnakeBite />
            </span>
          ) : (
            <div className="bg-green-500 rounded-sm w-full h-full"></div>
          )}
        </div>
      ))}
    </>
  );
}
