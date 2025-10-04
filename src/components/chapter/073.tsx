import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { industry: "Office and admin support", exposure: 46 },
  { industry: "Legal", exposure: 44 },
  { industry: "Architecture and engineering", exposure: 37 },
  { industry: "Life, physical and social science", exposure: 36 },
  { industry: "Business and financial operations", exposure: 35 },
  { industry: "Community and social service", exposure: 33 },
  { industry: "Management", exposure: 32 },
  { industry: "Sales and related", exposure: 31 },
  { industry: "Computer and mathematical", exposure: 29 },
  { industry: "Protective service", exposure: 28 },
  { industry: "Farming, fishing and forestry", exposure: 28 },
  { industry: "Healthcare practitioners and technical", exposure: 28 },
  { industry: "Educational instruction and library", exposure: 27 },
  { industry: "Healthcare support", exposure: 26 },
  { industry: "Arts, design, and media", exposure: 26 },
  { industry: "All industries", exposure: 25 },
  { industry: "Personal care and service", exposure: 19 },
  { industry: "Food preparation and serving related", exposure: 12 },
  { industry: "Transportation and material moving", exposure: 11 },
  { industry: "Production", exposure: 9 },
  { industry: "Construction and extraction", exposure: 6 },
  { industry: "Installation and repair", exposure: 4 },
  { industry: "Cleaning and maintenance", exposure: 1 },
];

const AIAutomationChart = () => {
  return (
    <div className="w-full h-[500px] p-2 bg-transparent">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 180, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[0, 50]}
            tick={{ fill: "#666", fontSize: 8 }}
          />
          <YAxis
            dataKey="industry"
            type="category"
            width={170}
            tick={{ fill: "#666", fontSize: 8 }}
          />
          <Tooltip contentStyle={{ fontSize: 10 }} />
          <Bar
            dataKey="exposure"
            fill="#999"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            shape={(props: any) => {
              const { fill, x, y, width, height } = props;
              const industry = props.payload.industry;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={industry === "All industries" ? "#B5D900" : fill}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AIAutomationChart;
