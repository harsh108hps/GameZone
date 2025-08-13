export default function Food({ position }) {
  const gridSize = 20;

  return (
    <div
      className="absolute food-pulsate"
      style={{
        left: `${position.x * gridSize}px`,
        top: `${position.y * gridSize}px`,
        width: `${gridSize}px`,
        height: `${gridSize}px`,
        // The container div acts as the outer glow and shadow
      }}
    >
      <div className="food-body w-full h-full rounded-full absolute" />
      <div className="food-highlight w-1/4 h-1/4 rounded-full absolute top-1/4 left-1/4" />
    </div>
  );
}
