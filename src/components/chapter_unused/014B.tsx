import React from "react";
import {
  Calculator,
  Monitor,
  BarChart3,
  Scale,
  MessageSquare,
  Database,
  User,
} from "lucide-react";

const disciplines = [
  { name: "Mathematics", Icon: Calculator },
  { name: "Computer Science", Icon: Monitor },
  { name: "Statistics", Icon: BarChart3 },
  { name: "Linguistics", Icon: MessageSquare },
  { name: "Psychology", Icon: User },
  { name: "Data Science", Icon: Database },
  { name: "Ethics", Icon: Scale },
];

const AIDisciplinesDiagram = () => {
  const centerX = 200;
  const centerY = 200;
  const radius = 120;
  const circleRadius = 80;
  const centralCircleRadius = 50; // Reduced size of central circle

  return (
    <svg width="400" height="400" viewBox="0 0 400 400">
      {disciplines.map((discipline, index) => {
        const angle = (index * 2 * Math.PI) / disciplines.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        return (
          <g
            key={discipline.name}
            className="animate-pop"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <circle
              cx={x}
              cy={y}
              r={circleRadius}
              fill="#d9f99d"
              fillOpacity="0.7"
            />{" "}
            {/* Semi-transparent */}
            <foreignObject x={x - 40} y={y - 40} width="80" height="80">
              <div className="flex flex-col items-center justify-center h-full">
                <discipline.Icon className="w-8 h-8 mb-1" />
                <span className="text-xs text-center font-semibold">
                  {discipline.name}
                </span>
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* Central AI circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={centralCircleRadius}
        fill="#4b5563"
      />
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="24"
        fontWeight="bold"
      >
        AI
      </text>
    </svg>
  );
};

const PopAnimation = () => (
  <style jsx global>{`
    @keyframes pop {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      80% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .animate-pop {
      animation: pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      opacity: 0;
    }
  `}</style>
);

const AnimatedAIDisciplinesDiagram = () => (
  <>
    <PopAnimation />
    <AIDisciplinesDiagram />
  </>
);

export default AnimatedAIDisciplinesDiagram;
