import React, { useState, useEffect } from "react";

const ExponentialGrowthChessboard = () => {
  const [currentSquare, setCurrentSquare] = useState(0);
  const totalSquares = 64;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSquare((prev) => (prev < totalSquares ? prev + 1 : prev));
    }, 100); // Changed from 333ms to 100ms

    return () => clearInterval(timer);
  }, []);

  const getGrainCount = (square) => {
    return square === 0 ? 0 : Math.pow(2, square - 1);
  };

  const getCircleSize = () => {
    if (currentSquare === 0) return 0;
    const totalGrains = Math.pow(2, currentSquare) - 1;
    const maxGrains = Math.pow(2, totalSquares) - 1;
    return (totalGrains / maxGrains) * 100;
  };

  const getTotalGrains = () => {
    return Math.pow(2, currentSquare) - 1;
  };

  return (
    <div className="flex items-start justify-between p-4 w-full">
      <div className="w-1/2 flex flex-col items-center">
        <div
          className="grid grid-cols-8 w-fit mb-4"
          style={{ height: "256px", width: "256px" }}
        >
          {[...Array(totalSquares)].map((_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isBlack = (row + col) % 2 === 1;
            const isCompleted = index < currentSquare;
            return (
              <div
                key={index}
                className={`flex items-center justify-center text-xs
                  ${isBlack ? "bg-gray-600" : "bg-gray-200"}`}
                style={{ height: "32px", width: "32px" }}
              >
                {isCompleted && (
                  <span
                    className={`font-bold ${
                      isBlack ? "text-white" : "text-black"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center w-full">
          <p className="mb-2 text-lg">
            Grains: {getGrainCount(currentSquare).toLocaleString()}
          </p>
          <p className="text-base">
            Total grains: {getTotalGrains().toLocaleString()}
          </p>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center">
        <div className="relative w-64 h-64 bg-gray-200 rounded-full">
          <div
            className="absolute rounded-full bg-gray-600 transition-all duration-100 ease-out"
            style={{
              width: `${getCircleSize()}%`,
              height: `${getCircleSize()}%`,
              top: `${50 - getCircleSize() / 2}%`,
              left: `${50 - getCircleSize() / 2}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ExponentialGrowthChessboard;
