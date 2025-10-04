import React, { useState, useEffect, useRef } from "react";

const SunflowerGrowthVisualization = () => {
  const [time, setTime] = useState(0);
  const totalElements = 1000;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
  const hasFilledRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 4); // Keep increasing; we'll loop erasing via fractional part
    }, 20); // Keep the interval at 20ms
    return () => clearInterval(interval);
  }, []);

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  const generateSeeds = () => {
    const seeds = [];

    // Initial growth up to totalElements, then keep constant count
    const growthProgress = Math.min(time / totalElements, 1);
    const growthFactor = Math.pow(growthProgress, 1.5);
    const visibleDuringGrowth = Math.min(
      Math.floor(totalElements * growthFactor),
      totalElements
    );

    if (!hasFilledRef.current && visibleDuringGrowth >= totalElements) {
      hasFilledRef.current = true;
    }

    const count = hasFilledRef.current ? totalElements : visibleDuringGrowth;

    // After filling, rotate a window continuously using repeating erasing progress
    const loopTBase = Math.max(0, time - totalElements) / totalElements; // 0..inf
    const loopT = loopTBase - Math.floor(loopTBase); // fractional part -> 0..1 repeating
    const easedErasingProgress = easeInOutCubic(loopT);
    const offset = Math.floor(easedErasingProgress * totalElements);

    for (let k = 0; k < count; k++) {
      const i = (k + offset) % totalElements;
      const angle = i * goldenAngle;
      const distance = Math.sqrt(i) * 0.6;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const ageProgress = count > 1 ? k / (count - 1) : 1;
      const biasedAge = hasFilledRef.current
        ? Math.pow(ageProgress, 1.5)
        : ageProgress;
      const scale = easeInOutCubic(biasedAge);

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
