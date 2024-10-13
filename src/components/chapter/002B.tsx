import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const options = [
  { label: "Never", value: 0 },
  { label: "Monthly", value: 1 },
  { label: "Weekly", value: 2 },
  { label: "Daily", value: 3 },
  { label: "Right now", value: 4 },
];

const AIUsageSurvey = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (value: number) => {
    setSelectedOption(value);
    setShowResults(true);
  };

  // Dummy data for distribution (replace with real data in a full implementation)
  const distributionData = options.map((option) => ({
    name: option.label,
    value: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">How often are you using AI?</h2>
      <div className="flex justify-between mb-6">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            className={`px-4 py-2 rounded ${
              selectedOption === option.value
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {showResults && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AIUsageSurvey;
