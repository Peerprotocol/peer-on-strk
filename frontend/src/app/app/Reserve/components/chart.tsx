import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "13/6", "Borrow TVL": 271.09, "Borrow APY": 27.04 },
  { date: "13/6", "Borrow TVL": 242.39, "Borrow APY": 27.83 },
  { date: "13/6", "Borrow TVL": 258.14, "Borrow APY": 27.45 },
  { date: "13/6", "Borrow TVL": 266.32, "Borrow APY": 26.78 },
  { date: "13/6", "Borrow TVL": 240.37, "Borrow APY": 27.93 },
  { date: "13/6", "Borrow TVL": 251.41, "Borrow APY": 27.24 },
  { date: "13/6", "Borrow TVL": 249.41, "Borrow APY": 21.24 },
  { date: "13/6", "Borrow TVL": 236.44, "Borrow APY": 28.15 },
];

const ReserveChart = () => {
  const [mode, setMode] = useState<"Borrow" | "Supply">("Borrow");
  const [period, setPeriod] = useState("15D");

  const [lineVisibility, setLineVisibility] = useState<{
    "Borrow TVL": boolean;
    "Borrow APY": boolean;
  }>({
    "Borrow TVL": true,
    "Borrow APY": true,
  });

  const handleModeChange = () => {
    setMode(mode === "Borrow" ? "Supply" : "Borrow");
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  const toggleLineVisibility = (lineKey: "Borrow TVL" | "Borrow APY") => {
    setLineVisibility((prev) => ({
      ...prev,
      [lineKey]: !prev[lineKey],
    }));
  };

  const CheckmarkIcon = ({ backgroundColor }: { backgroundColor?: string }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ backgroundColor, width: 20, height: 20, borderRadius: "5px" }}
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  };

  const renderLegend = (data: {
    payload: { value: string; color: string }[];
  }) => {
    const { payload } = data;

    return (
      <ul className="flex items-center justify-evenly mt-6">
        {payload.map((entry, index) => (
          <li
            key={`item-${index}`}
            className="w-fit text-black inline-flex items-center text-xs gap-2"
            onClick={() =>
              toggleLineVisibility(entry.value as "Borrow TVL" | "Borrow APY")
            }
          >
            <CheckmarkIcon backgroundColor={entry.color} />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button
          className="inline-flex py-2 px-2 rounded-3xl border border-black w-fit items-center gap-1 text-black font-normal text-sm lg:text-[15px]"
          onClick={handleModeChange}
        >
          {mode}
          <ChevronDownIcon />
        </button>
        <div className="flex items-center">
          <span className="mr-2">Period:</span>
          <button
            className="inline-flex py-2 px-2 rounded-3xl border border-black w-fit items-center gap-1 text-black font-normal text-sm lg:text-[15px]"
            onClick={() => handlePeriodChange("15D")}
          >
            Period {period}
            <ChevronDownIcon />
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            className="font-bold text-sm text-black"
            tickLine={false}
            tickMargin={10}
            tickSize={10}
            padding={{ left: 30, right: 30 }}
          />
          <YAxis
            yAxisId="left"
            type="number"
            domain={[0.0, 300.0]}
            className="text-[10px]"
            tickFormatter={(value) => `${parseFloat(value.toFixed(2))}M`}
            tickCount={6}
            tickLine={false}
            tickMargin={10}
            allowDecimals
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            type="number"
            domain={[-40, 60]}
            orientation="right"
            className="text-[10px]"
            tickFormatter={(value) => `${parseFloat(value.toFixed(2))}%`}
            tickCount={6}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity="0.5" />
          <Tooltip />
          <Legend
            content={renderLegend({
              payload: [
                { value: `${mode} TVL`, color: "#4CAF50" },
                { value: `${mode} APY`, color: "#F44336" },
              ],
            })}
          />
          {lineVisibility[`${mode} TVL` as "Borrow TVL" | "Borrow APY"] && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={`${mode} TVL`}
              stroke="#4CAF50"
              strokeWidth={2}
              legendType="square"
              dot={false}
            />
          )}
          {lineVisibility[`${mode} APY` as "Borrow TVL" | "Borrow APY"] && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={`${mode} APY`}
              stroke="#F44336"
              strokeWidth={2}
              legendType="square"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReserveChart;
