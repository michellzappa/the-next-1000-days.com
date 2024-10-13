import React, { useState, useEffect } from "react";

const BlindMenAndAI = () => {
  const [spotlights, setSpotlights] = useState(() =>
    Array(3)
      .fill(null)
      .map(() => ({
        x: Math.random() * 220 + 40, // Ensure initial position is within bounds
        y: Math.random() * 220 + 40,
        dx: (Math.random() - 0.5) * 4.5, // Increased from 3 to 4.5 (50% faster)
        dy: (Math.random() - 0.5) * 4.5, // Increased from 3 to 4.5 (50% faster)
      }))
  );

  const updateSpotlights = () => {
    setSpotlights((prev) =>
      prev.map((spot) => {
        let newX = spot.x + spot.dx;
        let newY = spot.y + spot.dy;
        let newDx = spot.dx;
        let newDy = spot.dy;

        // Bounce when edges hit the boundaries
        if (newX <= 40 || newX >= 260) {
          newDx = -newDx;
          newX = Math.max(40, Math.min(260, newX)); // Clamp x position
        }
        if (newY <= 40 || newY >= 260) {
          newDy = -newDy;
          newY = Math.max(40, Math.min(260, newY)); // Clamp y position
        }

        return { x: newX, y: newY, dx: newDx, dy: newDy };
      })
    );
  };

  useEffect(() => {
    const intervalId = setInterval(updateSpotlights, 50);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "50vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 300"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <mask id="spotlightMask">
            <rect width="300" height="300" fill="black" />
            {spotlights.map((spot, index) => (
              <circle key={index} cx={spot.x} cy={spot.y} r="40" fill="white" />
            ))}
          </mask>
        </defs>

        {/* White background for spotlights */}
        <g mask="url(#spotlightMask)">
          <rect width="300" height="300" fill="white" />
        </g>

        {/* AI text, only visible within spotlights */}
        <text
          x="150"
          y="150"
          fontSize="150"
          fontWeight="bold"
          fill="black"
          textAnchor="middle"
          dominantBaseline="central"
          mask="url(#spotlightMask)"
          style={{
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          AI
        </text>

        {/* White outlines for spotlights */}
        {spotlights.map((spot, index) => (
          <circle
            key={`outline-${index}`}
            cx={spot.x}
            cy={spot.y}
            r="40"
            fill="none"
            stroke="white"
            strokeWidth="0"
          />
        ))}
      </svg>
    </div>
  );
};

export default BlindMenAndAI;
