import React, { useState, useEffect } from "react";

const SunflowerGrowthVisualization = () => {
  const [time, setTime] = useState(0);
  const totalElements = 1000;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => (prevTime + 2) % (totalElements * 2));
    }, 20); // Keep the interval at 20ms, but increment by 2 instead of 1
    return () => clearInterval(interval);
  }, []);

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  const generateSeeds = () => {
    const seeds = [];
    const growthFactor = Math.pow(time / totalElements, 1.5);
    const visibleSeeds = Math.min(
      Math.floor(totalElements * growthFactor),
      totalElements
    );

    // Adjust the erasing process
    const erasingProgress = Math.max(0, (time - totalElements) / totalElements);
    const easedErasingProgress = easeInOutCubic(erasingProgress);
    const erasingSeeds = Math.floor(easedErasingProgress * totalElements);

    for (let i = erasingSeeds; i < visibleSeeds; i++) {
      const angle = i * goldenAngle;
      const distance = Math.sqrt(i) * 0.6;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const ageProgress = (i - erasingSeeds) / (visibleSeeds - erasingSeeds);
      const scale = easeInOutCubic(ageProgress);

      seeds.push({ x, y, scale });
    }

    return seeds;
  };

  return (
    <div className="w-full h-[75vh] max-h-[400px] min-h-[300px] bg-transparent flex items-center justify-center overflow-hidden">
      {generateSeeds().map((seed, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-black dark:bg-white"
          style={{
            width: "0.5vmin",
            height: "0.5vmin",
            transform: `translate(-50%, -50%) translate(${seed.x * 1.2}vmin, ${
              seed.y * 1.2
            }vmin) scale(${seed.scale})`,
            opacity: seed.scale,
          }}
        />
      ))}
    </div>
  );
};

export default SunflowerGrowthVisualization;
