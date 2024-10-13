import React, { useState, useEffect } from "react";
import { Code2, Cpu, Users, Briefcase, CircleUser } from "lucide-react";

const AIExpertiseQuadrant = () => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const quadrants = [
    { title: "Technical Experts", icon: Code2 },
    { title: "AI Specialists", icon: Cpu },
    { title: "General Public & End Users", icon: Users },
    { title: "Strategists, Consultants, Leaders", icon: Briefcase },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep((prev) => {
        if (prev < 5) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setAnimationComplete(true);
          return prev;
        }
      });
    }, 500); // Adjust timing as needed

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-transparent p-8 font-sans flex items-start">
      <div className="relative aspect-square w-4/5">
        {/* Axes labels */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-semibold whitespace-nowrap -translate-x-16 flex items-center">
          <span className="mr-2">-</span>
          Technical Knowledge
          <span className="ml-2">+</span>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-semibold whitespace-nowrap flex items-center">
          <span className="mr-2">-</span>
          Strategic Understanding
          <span className="ml-2">+</span>
        </div>

        {/* Quadrant grid */}
        <div className="absolute inset-12 border-2 border-gray-300 grid grid-cols-2 grid-rows-2">
          {quadrants.map((quadrant, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 border border-gray-300"
            >
              <div
                className={`bg-gray-800 text-white rounded-full p-6 flex flex-col items-center justify-center w-36 h-36 transition-all duration-300 ${
                  animationComplete || animationStep > index
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0"
                }`}
              >
                <quadrant.icon className="w-12 h-12 mb-2" strokeWidth={1.5} />
                <div className="text-xs text-center">{quadrant.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Center circle */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-gray-300 rounded-full w-40 h-40 flex flex-col items-center justify-center z-10 transition-all duration-300 ${
            animationComplete || animationStep === 5
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0"
          }`}
        >
          <CircleUser
            className="w-12 h-12 mb-2 text-gray-800"
            strokeWidth={1.5}
          />
          <div className="text-center text-sm">
            <strong>You:</strong>
            <br />
            Some technical and some strategic expertise.
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="w-1/5 ml-4">
        <div className="bg-white bg-opacity-80 p-4 rounded">
          <h3 className="font-semibold mb-2">Legend</h3>
          <div className="text-sm">
            <p className="mb-2">
              <strong>Technical Knowledge:</strong> You need a solid
              understanding of technical concepts but are not expected to be an
              expert.
            </p>
            <p>
              <strong>Strategic Understanding:</strong> You should have a good
              understanding of the implications of AI on society and
              organizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIExpertiseQuadrant;
