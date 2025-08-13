import { FaAppleAlt, FaBomb } from "react-icons/fa";
import { PiOrangeFill } from "react-icons/pi";

export default function Food({ position }) {
  const gridSize = 20;

  const iconStyles = {
    normal: { icon: <PiOrangeFill color="orange" size={gridSize} /> },
    bonus: { icon: <FaAppleAlt color="red" size={gridSize} /> },
    poison: { icon: <FaBomb color="black" size={gridSize} /> },
  };

  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        left: `${position.x * gridSize}px`,
        top: `${position.y * gridSize}px`,
        width: `${gridSize}px`,
        height: `${gridSize}px`,
      }}
    >
      {iconStyles[position.type]?.icon}
    </div>
  );
}