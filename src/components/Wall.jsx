export default function Wall({ boardSize, gridSize }) {
  const wallCells = [];

  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      // Only top, bottom, left, right edges
      if (x === 0 || y === 0 || x === boardSize - 1 || y === boardSize - 1) {
        wallCells.push({ x, y });
      }
    }
  }

  return (
    <>
      {wallCells.map((cell, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${gridSize}px`,
            height: `${gridSize}px`,
            left: `${cell.x * gridSize}px`,
            top: `${cell.y * gridSize}px`,
            backgroundColor: i % 2 === 0 ? "#8B0000" : "#B22222", // dark red & firebrick
            border: "1px solid #5A1A1A",
          }}
        />
      ))}
    </>
  );
}