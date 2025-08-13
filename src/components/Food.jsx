export default function Food({ position }) {
  const gridSize = 20;
  return (
    <div
      className="absolute bg-red-500 rounded-full"
      style={{
        left: `${position.x * gridSize}px`,
        top: `${position.y * gridSize}px`,
        width: `${gridSize}px`,
        height: `${gridSize}px`
      }}
    ></div>
  );
}
