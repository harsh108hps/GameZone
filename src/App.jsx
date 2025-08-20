import GameBoard from "./components/GameBoard";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mt-6">Naagin Express 🐍</h1>
      <GameBoard />
    </div>
  );
}
