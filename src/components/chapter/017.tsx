import React, { useState, useEffect } from "react";
import { Monitor, User, Eye, Sparkle, Cpu, Brain } from "lucide-react";

const aiTypes = [
  {
    name: "Reactive Machines",
    Icon: Monitor,
    description:
      "Chess programs like IBM's Deep Blue, Spam Filters, Rice Cookers.",
  },
  {
    name: "Limited Memory",
    Icon: User,
    description:
      "Autonomous Vehicles, Customer Service Chatbots, Facial Recognition, TikTok, E-Commerce Rec's.",
  },
  {
    name: "Predictive AI",
    Icon: Eye,
    description:
      "Credit Scoring, Demand Forecasting, Weather, Fraud Detection, Healthcare Diagnostics.",
  },
  {
    name: "Generative AI",
    Icon: Sparkle,
    description:
      "Content Creation, Drug Discovery, Deep Fakes, Personalized Marketing.",
  },
  {
    name: "Autonomous AI",
    Icon: Cpu,
    description:
      "Robotics in Manufacturing, Smart Home Devices, Surgical Robots, Smart Grids.",
  },
  {
    name: "Theory of Mind AI",
    Icon: Brain,
    description:
      "Social Robots, Personalized Tutors, Interactive Entertainment, Negotiation and Mediation.",
  },
];

const AITypesGrid = () => {
  const [visibleBoxes, setVisibleBoxes] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleBoxes((prev) => (prev < aiTypes.length ? prev + 1 : prev));
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-3 grid-rows-2 gap-4">
        {aiTypes.map((type, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg p-4 shadow-md flex flex-col items-center text-center ${
              index < visibleBoxes ? "animate-pop" : "opacity-0"
            }`}
          >
            <type.Icon className="w-12 h-12 mb-2" />
            <h2 className="text-lg font-semibold mb-2">{type.name}</h2>
            <p className="text-sm">{type.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PopAnimation = () => (
  <style jsx global>{`
    @keyframes pop {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .animate-pop {
      animation: pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    }
  `}</style>
);

const AnimatedAITypesGrid = () => (
  <>
    <PopAnimation />
    <AITypesGrid />
  </>
);

export default AnimatedAITypesGrid;
