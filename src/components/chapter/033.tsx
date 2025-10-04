import React from "react";
import { ChevronRight } from "lucide-react";

const AIGrowthVisualization = () => {
  const stages = [{ aiSize: 80 }, { aiSize: 120 }, { aiSize: 160 }];
  const youSize = 60;

  return (
    <div className="flex items-center justify-center w-full h-44 bg-transparent">
      {stages.map((stage, index) => (
        <React.Fragment key={index}>
          <div
            className="relative flex-shrink-0"
            style={{ width: stage.aiSize, height: stage.aiSize }}
          >
            <div
              className="absolute rounded-full bg-lime-300 transition-all duration-500 ease-in-out flex items-center justify-center"
              style={{
                width: `${stage.aiSize}px`,
                height: `${stage.aiSize}px`,
              }}
            >
              <div
                className="absolute rounded-full bg-gray-800 flex flex-col items-center justify-center"
                style={{
                  width: `${youSize}px`,
                  height: `${youSize}px`,
                }}
              >
                <div
                  className="absolute text-xs font-bold text-black"
                  style={{ top: `-${youSize / 4}px` }}
                >
                  AI
                </div>
                <div className="text-xs font-bold text-white">You</div>
              </div>
            </div>
          </div>
          {index < stages.length - 1 && (
            <ChevronRight
              className="flex-shrink-0 mx-0 text-gray-600"
              size={20}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default AIGrowthVisualization;
