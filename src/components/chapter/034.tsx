import React, { useState, useEffect } from "react";

const SkillDistributionCurve = () => {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    // Start the animation sequence
    setAnimationStage(1);

    // Animate the graph line after a short delay
    const lineTimer = setTimeout(() => setAnimationStage(2), 500);

    // Show the bubbles after the line animation
    const bubbleTimer = setTimeout(() => setAnimationStage(3), 2500);

    return () => {
      clearTimeout(lineTimer);
      clearTimeout(bubbleTimer);
    };
  }, []);

  const normalDistribution = (x, mean = 0, stdDev = 1) => {
    return (
      Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2)) /
      (stdDev * Math.sqrt(2 * Math.PI))
    );
  };

  const generateCurvePoints = () => {
    const points = [];
    for (let x = -3; x <= 3.05; x += 0.05) {
      points.push({ x: x * 80 + 320, y: 400 - normalDistribution(x) * 720 });
    }
    return points.map((p) => `${p.x},${p.y}`).join(" ");
  };

  // New light gray color
  const lightGray = "#D3D3D3";

  // New color for bubbles and arrows
  const accentColor = "#B5D900";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 640 480"
        preserveAspectRatio="xMidYMid meet"
      >
        <style>
          {`
            @keyframes drawLine { from { stroke-dashoffset: 800; } to { stroke-dashoffset: 0; } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .line-animated { 
              stroke-dasharray: 800; 
              animation: drawLine 2s ease-out forwards; 
            }
            .fade-in { animation: fadeIn 1s ease-out forwards; }
          `}
        </style>

        {/* Normal distribution curve */}
        {animationStage >= 2 && (
          <polyline
            points={generateCurvePoints()}
            fill="none"
            stroke="black"
            strokeWidth="2.4"
            className="line-animated"
          />
        )}

        {/* Vertical lines and skill level labels */}
        <g>
          <line
            x1="80"
            y1="40"
            x2="80"
            y2="424"
            stroke="gray"
            strokeWidth="0.8"
            strokeDasharray="4,4"
          />
          <line
            x1="320"
            y1="40"
            x2="320"
            y2="424"
            stroke="gray"
            strokeWidth="0.8"
            strokeDasharray="4,4"
          />
          <line
            x1="560"
            y1="40"
            x2="560"
            y2="424"
            stroke="gray"
            strokeWidth="0.8"
            strokeDasharray="4,4"
          />

          <text x="80" y="448" fontSize="19" fill="black" textAnchor="middle">
            Low Skill
          </text>
          <text x="320" y="448" fontSize="19" fill="black" textAnchor="middle">
            Average Skill
          </text>
          <text x="560" y="448" fontSize="19" fill="black" textAnchor="middle">
            High Skill
          </text>
        </g>

        {/* AI augmentation circles, arrows, and gain percentages */}
        {animationStage >= 3 && (
          <g className="fade-in">
            <circle cx="220" cy="280" r="48" fill={accentColor} />
            <circle cx="420" cy="280" r="40" fill={accentColor} />
            <line
              x1="268"
              y1="280"
              x2="316"
              y2="280"
              stroke={accentColor}
              strokeWidth="3.2"
              markerEnd="url(#arrowhead)"
            />
            <line
              x1="460"
              y1="280"
              x2="500"
              y2="280"
              stroke={accentColor}
              strokeWidth="3.2"
              markerEnd="url(#arrowhead)"
            />

            <text
              x="220"
              y="272"
              fontSize="19"
              textAnchor="middle"
              fill="black"
            >
              43%
            </text>
            <text
              x="220"
              y="296"
              fontSize="19"
              textAnchor="middle"
              fill="black"
            >
              gain
            </text>
            <text
              x="420"
              y="272"
              fontSize="19"
              textAnchor="middle"
              fill="black"
            >
              17%
            </text>
            <text
              x="420"
              y="296"
              fontSize="19"
              textAnchor="middle"
              fill="black"
            >
              gain
            </text>
          </g>
        )}

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="5.6"
            refX="0"
            refY="2.8"
            orient="auto"
          >
            <polygon points="0 0, 8 2.8, 0 5.6" fill={accentColor} />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export default SkillDistributionCurve;
