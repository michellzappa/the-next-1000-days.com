import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { year: 1993, gflops: 124 },
  { year: 1994, gflops: 170 },
  { year: 1995, gflops: 170 },
  { year: 1996, gflops: 368 },
  { year: 1997, gflops: 1300 },
  { year: 1998, gflops: 1300 },
  { year: 1999, gflops: 2400 },
  { year: 2000, gflops: 4900 },
  { year: 2001, gflops: 7200 },
  { year: 2002, gflops: 35900 },
  { year: 2003, gflops: 35900 },
  { year: 2004, gflops: 70700 },
  { year: 2005, gflops: 280600 },
  { year: 2006, gflops: 280600 },
  { year: 2007, gflops: 478200 },
  { year: 2008, gflops: 1100000 },
  { year: 2009, gflops: 1800000 },
  { year: 2010, gflops: 2600000 },
  { year: 2011, gflops: 10500000 },
  { year: 2012, gflops: 17600000 },
  { year: 2013, gflops: 33900000 },
  { year: 2014, gflops: 33900000 },
  { year: 2015, gflops: 33900000 },
  { year: 2016, gflops: 93000000 },
  { year: 2017, gflops: 93000000 },
  { year: 2018, gflops: 143500000 },
  { year: 2019, gflops: 148600000 },
  { year: 2020, gflops: 442000000 },
  { year: 2021, gflops: 442000000 },
  { year: 2022, gflops: 1100000000 },
  { year: 2023, gflops: 1200000000 },
];

const SupercomputerPowerChart = () => {
  const [currentYear, setCurrentYear] = useState(1993);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentYear((prevYear) => {
        if (prevYear < 2023) {
          return prevYear + 1;
        } else {
          clearInterval(interval);
          return prevYear;
        }
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const currentData = data.filter((item) => item.year <= currentYear);

  const formatYAxis = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)} billion`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)} million`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const yAxisTicks = [
    100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000,
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 font-sans">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">
        Computational capacity of the fastest supercomputers
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        The number of floating-point operations carried out per second by the
        fastest supercomputer in any given year. This is expressed in gigaFLOPS,
        equivalent to 10⁹ floating-point operations per second.
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
        >
          <XAxis
            dataKey="year"
            type="number"
            domain={["dataMin", "dataMax"]}
            ticks={[1993, 1995, 2000, 2005, 2010, 2015, 2020, 2023]}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            scale="log"
            domain={[100, "dataMax"]}
            tickFormatter={formatYAxis}
            ticks={yAxisTicks}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => `${formatYAxis(value)} GFLOPS`}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="gflops"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            data={currentData}
            dataKey="gflops"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-4">
        Source: Dongarra et al. (2023)
      </p>
    </div>
  );
};

export default SupercomputerPowerChart;
