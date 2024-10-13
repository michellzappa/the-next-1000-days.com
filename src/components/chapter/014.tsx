import React, { useState, useEffect } from "react";
import {
  Monitor,
  BarChart2,
  Calculator,
  Scale,
  MessageSquare,
  Brain,
  Database,
} from "lucide-react";

const fields = [
  { name: "Computer Science", icon: Monitor },
  { name: "Statistics", icon: BarChart2 },
  { name: "Mathematics", icon: Calculator },
  { name: "Ethics", icon: Scale },
  { name: "Linguistics", icon: MessageSquare },
  { name: "Psychology", icon: Brain },
  { name: "Data Science", icon: Database },
];

const FieldList = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}
  >
    {fields.map((field, index) => (
      <div
        key={index}
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <field.icon size={24} />
        </div>
        <span>{field.name}</span>
      </div>
    ))}
  </div>
);

const BlindMenAndAI = () => {
  const [spotlights, setSpotlights] = useState(() =>
    Array(7)
      .fill(null)
      .map(() => ({
        x: Math.random() * 220 + 40,
        y: Math.random() * 220 + 40,
        dx: (Math.random() - 0.5) * 4.5,
        dy: (Math.random() - 0.5) * 4.5,
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
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "40px",
        }}
      >
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <mask id="spotlightMask">
              <rect width="300" height="300" fill="black" />
              {spotlights.map((spot, index) => (
                <circle
                  key={index}
                  cx={spot.x}
                  cy={spot.y}
                  r="30"
                  fill="white"
                />
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
              r="30"
              fill="none"
              stroke="white"
              strokeWidth="0"
            />
          ))}
        </svg>
        <FieldList />
      </div>
    </div>
  );
};

export default BlindMenAndAI;
