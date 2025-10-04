import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const NeuralNetworkAnimation = () => {
  const [activationLayer, setActivationLayer] = useState(0);
  const layers = [4, 5, 6, 4]; // Input, hidden layers, output layer

  useEffect(() => {
    const timer = setInterval(() => {
      setActivationLayer((prev) => (prev + 1) % layers.length);
    }, 1000); // Move to next layer every second
    return () => clearInterval(timer);
  }, [layers.length]);

  const Node = ({
    x,
    y,
    isActive,
  }: {
    x: number;
    y: number;
    isActive: boolean;
  }) => (
    <motion.circle
      cx={x}
      cy={y}
      r={8}
      fill={`var(--node-${isActive ? "active" : "inactive"})`}
      initial={{ scale: 1 }}
      animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 0.5 }}
    />
  );

  const Edge = ({
    x1,
    y1,
    x2,
    y2,
    isActive,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    isActive: boolean;
  }) => (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={`var(--edge-${isActive ? "active" : "inactive"})`}
      strokeWidth={isActive ? 2 : 1}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: isActive ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    />
  );

  const renderNetwork = () => {
    const nodes: JSX.Element[] = [];
    const edges: JSX.Element[] = [];
    const width = 500;
    const height = 300;
    const layerSpacing = width / (layers.length - 1);

    layers.forEach((nodeCount, layerIndex) => {
      const x = layerIndex * layerSpacing;
      const verticalSpacing = height / (nodeCount + 1);
      const isLayerActive = layerIndex === activationLayer;
      const isNextLayerActive =
        (layerIndex + 1) % layers.length === activationLayer;

      for (let i = 0; i < nodeCount; i++) {
        const y = (i + 1) * verticalSpacing;
        nodes.push(
          <Node
            key={`node-${layerIndex}-${i}`}
            x={x}
            y={y}
            isActive={isLayerActive}
          />
        );

        if (layerIndex < layers.length - 1) {
          const nextLayerNodes = layers[layerIndex + 1];
          const nextX = (layerIndex + 1) * layerSpacing;
          const nextVerticalSpacing = height / (nextLayerNodes + 1);

          for (let j = 0; j < nextLayerNodes; j++) {
            const nextY = (j + 1) * nextVerticalSpacing;
            edges.push(
              <Edge
                key={`edge-${layerIndex}-${i}-${j}`}
                x1={x}
                y1={y}
                x2={nextX}
                y2={nextY}
                isActive={isLayerActive || isNextLayerActive}
              />
            );
          }
        }
      }
    });

    return [...edges, ...nodes];
  };

  return (
    <div className="neural-network-container">
      <svg width="100%" height="300" viewBox="0 0 500 300">
        {renderNetwork()}
      </svg>
      <style jsx>{`
        .neural-network-container {
          --node-inactive: #333333;
          --node-active: #666666;
          --edge-inactive: #666666;
          --edge-active: #999999;
        }
        @media (prefers-color-scheme: dark) {
          .neural-network-container {
            --node-inactive: #aaaaaa;
            --node-active: #dddddd;
            --edge-inactive: #888888;
            --edge-active: #bbbbbb;
          }
        }
      `}</style>
    </div>
  );
};

export default NeuralNetworkAnimation;
