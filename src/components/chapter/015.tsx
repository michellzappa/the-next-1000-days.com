import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const milestoneData = [
  { year: 2012, milestones: ["AlexNet"] },
  { year: 2013, milestones: ["Word Embeddings"] },
  { year: 2014, milestones: ["GANs"] },
  { year: 2015, milestones: ["ResNet"] },
  { year: 2016, milestones: ["AlphaGo"] },
  { year: 2017, milestones: ["Attention Is All You Need"] },
  { year: 2018, milestones: ["BERT"] },
  { year: 2019, milestones: ["GPT-2"] },
  { year: 2020, milestones: ["GPT-3", "DALL-E"] },
  { year: 2021, milestones: ["Codex", "AlphaFold 2"] },
  { year: 2022, milestones: ["ChatGPT", "Stable Diffusion", "Midjourney"] },
  { year: 2023, milestones: ["GPT-4", "Claude", "LLaMA", "Bard"] },
  {
    year: 2024,
    milestones: ["Gemini", "GPT-4o", "Sora", "Mixtral", "LLaMA 3"],
  },
];

const AITimelineComponent = () => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const svgWidth = 1000;
  const svgHeight = 700;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const graphWidth = svgWidth - margin.left - margin.right;
  const graphHeight = svgHeight - margin.top - margin.bottom;
  const circleRadius = 35;
  const circleOverlap = 0.1; // 10% overlap

  useEffect(() => {
    const animationDuration = 2000; // 2 seconds
    const startTime = Date.now();

    const animateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };

    requestAnimationFrame(animateProgress);
  }, []);

  const xScale = (year, index) => {
    const totalYears = milestoneData.length;
    const effectiveWidth = circleRadius * 2 * (1 - circleOverlap);
    const totalWidth =
      effectiveWidth * totalYears + circleRadius * 2 * circleOverlap;
    const startX = (graphWidth - totalWidth) / 2;
    return startX + index * effectiveWidth;
  };

  const getYPosition = (milestoneIndex, totalMilestones) => {
    const effectiveCircleHeight = circleRadius * 2 * (1 - circleOverlap);
    const stackHeight =
      effectiveCircleHeight * totalMilestones +
      circleRadius * 2 * circleOverlap;
    return graphHeight - stackHeight + milestoneIndex * effectiveCircleHeight;
  };

  const wrapText = (text, maxLength = 10) => {
    if (text.length <= maxLength) return [text];
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);

    return lines;
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex justify-center items-center">
      <svg width={svgWidth} height={svgHeight}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* X-axis */}
          <line
            x1="0"
            y1={graphHeight}
            x2={graphWidth}
            y2={graphHeight}
            stroke="black"
          />
          {milestoneData.map(({ year }, index) => (
            <text
              key={year}
              x={xScale(year, index)}
              y={graphHeight + 20}
              textAnchor="middle"
              fontSize="10"
            >
              {year}
            </text>
          ))}

          {/* Milestones */}
          {milestoneData.map(({ year, milestones }, yearIndex) => (
            <g key={year}>
              {milestones.map((milestone, index) => {
                const x = xScale(year, yearIndex);
                const y = getYPosition(index, milestones.length);
                const shouldShow =
                  animationProgress > yearIndex / (milestoneData.length - 1);
                const wrappedText = wrapText(milestone);

                return (
                  <motion.g
                    key={`${year}-${milestone}`}
                    initial={{ opacity: 0, y: graphHeight }}
                    animate={{
                      opacity: shouldShow ? 1 : 0,
                      y: shouldShow ? y : graphHeight,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <circle
                      cx={x}
                      cy={0}
                      r={circleRadius}
                      fill="#d4fc79"
                      stroke="#96e6a1"
                      strokeWidth="2"
                    />
                    {wrappedText.map((line, lineIndex) => (
                      <text
                        key={lineIndex}
                        x={x}
                        y={lineIndex * 12 - (wrappedText.length - 1) * 6}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="8"
                      >
                        {line}
                      </text>
                    ))}
                  </motion.g>
                );
              })}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default AITimelineComponent;
