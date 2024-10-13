import React, { useEffect, useState } from "react";
import { Lightbulb, TrendingUp, Book } from "lucide-react";

const ThreeCircles = () => {
  const [visibleCircles, setVisibleCircles] = useState(0);

  const circles = [
    { label: "Strategic Insights", Icon: Lightbulb },
    { label: "Stay Ahead", Icon: TrendingUp },
    { label: "Applicable Skills", Icon: Book },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCircles((prev) => (prev < circles.length ? prev + 1 : prev));
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-center items-center space-x-8 bg-transparent p-4">
      {circles.map(({ label, Icon }, index) => (
        <div
          key={label}
          className={`transition-all duration-500 ease-out ${
            index < visibleCircles
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="w-32 h-32 rounded-full bg-black flex flex-col items-center justify-center text-white">
            <Icon size={24} className="mb-2" />
            <div className="text-xs text-center px-2">
              {label.split(" ").map((word, i) => (
                <div key={i}>{word}</div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreeCircles;
