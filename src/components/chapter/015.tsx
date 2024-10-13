import React, { useState, useEffect } from "react";

const milestonesData = [
  { year: 2012, milestones: ["AlexNet"] },
  { year: 2013, milestones: ["Word Embeddings"] },
  { year: 2014, milestones: ["GANs"] },
  { year: 2015, milestones: ["ResNet", "DRL"] },
  { year: 2016, milestones: ["AlphaGo", "TensorFlow"] },
  { year: 2017, milestones: ["Attention Is All You Need", "Transformers"] },
  { year: 2018, milestones: ["BERT"] },
  { year: 2019, milestones: ["GPT-2"] },
  { year: 2020, milestones: ["GPT-3", "AlphaFold 2"] },
  { year: 2021, milestones: ["DALL-E", "Codex"] },
  {
    year: 2022,
    milestones: [
      "ChatGPT",
      "Diffusion Models",
      "Stable Diffusion",
      "MidJourney",
    ],
  },
  {
    year: 2023,
    milestones: ["GPT-4", "Claude", "Bard", "LLaMA", "Perplexity"],
  },
  {
    year: 2024,
    milestones: ["Gemini", "GPT-4o", "Sora", "Claude 3", "Flux", "GPT-O1"],
  },
];

const AIMilestonesGraph = () => {
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const svgWidth = 1000;
  const svgHeight = 500;
  const yearWidth = svgWidth / milestonesData.length;
  const bubbleRadius = 38;
  const textWidth = bubbleRadius * 2; // 80% of bubble diameter
  const verticalSpacing = bubbleRadius * 1.6;
  const timelineOffset = 120;
  const textOffsetY = 5; // New constant for vertical text offset

  useEffect(() => {
    const totalBubbles = milestonesData.reduce(
      (sum, year) => sum + year.milestones.length,
      0
    );
    const intervalTime = 2000 / totalBubbles;

    const timer = setInterval(() => {
      setVisibleBubbles((prev) => {
        if (prev < totalBubbles) return prev + 1;
        clearInterval(timer);
        return totalBubbles;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  let bubbleCount = 0;

  return (
    <div className="w-full h-full font-inter">
      <svg width={svgWidth} height={svgHeight} className="mx-auto">
        <line
          x1="0"
          y1={svgHeight - 50}
          x2={svgWidth}
          y2={svgHeight - 50}
          stroke="black"
          strokeWidth="2"
        />

        {milestonesData.map((yearData, yearIndex) => (
          <g key={yearData.year}>
            <text
              x={yearIndex * yearWidth + yearWidth / 2}
              y={svgHeight - 20}
              textAnchor="middle"
              className="text-sm font-bold"
            >
              {yearData.year}
            </text>

            {yearData.milestones.map((milestone, milestoneIndex) => {
              bubbleCount++;
              const isVisible = bubbleCount <= visibleBubbles;
              const centerY =
                svgHeight - timelineOffset - milestoneIndex * verticalSpacing;
              const centerX = yearIndex * yearWidth + yearWidth / 2;
              return (
                <g
                  key={milestone}
                  className={isVisible ? "animate-pop-in" : "opacity-0"}
                >
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={bubbleRadius}
                    fill="white"
                    fillOpacity={0.8}
                    stroke="gray"
                    strokeWidth="1"
                  />
                  <foreignObject
                    x={centerX - textWidth / 2}
                    y={centerY - bubbleRadius + textOffsetY}
                    width={textWidth}
                    height={bubbleRadius * 2}
                  >
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      className="h-full flex items-center justify-center"
                    >
                      <p className="text-xs font-semibold text-center leading-tight">
                        {milestone}
                      </p>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default AIMilestonesGraph;
