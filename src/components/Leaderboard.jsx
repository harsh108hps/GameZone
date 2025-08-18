import React from "react";

export default function Leaderboard({ leaderboard, highestScore }) {
    // Helper to format positions
    const formatPosition = (index) => {
        if (index === 0) return "1st";
        if (index === 1) return "2nd";
        if (index === 2) return "3rd";
        return `${index + 1}th`;
    };

    return (
        <div className="w-64 bg-gray-800 text-white p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">🏆 Leaderboard</h2>
            <ul>
                {leaderboard.slice(0, 10).map((player, index) => {
                    const highlight = index < 3 ? "text-green-400 font-bold" : "text-white";
                    return (
                        <li key={index} className="flex justify-between py-1">
                            <span className={highlight}>
                                {formatPosition(index)} {player.name}
                            </span>
                            <span className={highlight}>{player.score}</span>
                        </li>
                    );
                })}
            </ul>
            <div className="mt-4 text-yellow-400 font-semibold">
                Highest Score: {highestScore}
            </div>
        </div>
    );
}