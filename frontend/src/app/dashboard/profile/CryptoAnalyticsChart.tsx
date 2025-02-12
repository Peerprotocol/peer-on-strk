import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

const AnalyticsChart = () => {
  const { address } = useAccount(); // Get connected Starknet address
  const [showBorrow, setShowBorrow] = useState(true);
  const [showLend, setShowLend] = useState(true);
  const [showDeposits, setShowDeposits] = useState(true);
  const [showWithdrawals, setShowWithdrawals] = useState(true);

  const [timePeriod, setTimePeriod] = useState("1 day");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!address) return;

    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `/api/database/transactions?user_address=${address}&period=${timePeriod}`
        );
        const rawData = await response.json();

        // Process Data: Count Transactions by Date
        const groupedData = rawData.reduce((acc: any, transaction: any) => {
          let dateKey = format(parseISO(transaction.timestamp), "yyyy-MM-dd"); // Default: group by day

          // Modify key for weekly/monthly grouping
          if (timePeriod === "1 week") {
            dateKey = format(parseISO(transaction.timestamp), "yyyy-'W'ww"); // Weekly grouping
          } else if (timePeriod === "1 month") {
            dateKey = format(parseISO(transaction.timestamp), "yyyy-MM"); // Monthly grouping
          }

          // Initialize if the key does not exist
          if (!acc[dateKey]) {
            acc[dateKey] = {
              name: dateKey,
              deposit: 0,
              withdraw: 0,
              borrow: 0,
              lend: 0,
            };
          }

          // Count occurrences of each transaction type
          acc[dateKey][transaction.transaction_type] += 1;

          return acc;
        }, {});

        // Convert grouped object to an array for Recharts
        setChartData(Object.values(groupedData));
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [address, timePeriod]);

  return (
    <div className="bg-white rounded-lg shadow-md mx-4 md:mx-8 text-black relative py-8 px-2 md:px-4">
      <div className="px-8 flex justify-between items-center relative">
        <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
        <select
          className="bg-white border border-gray-300 rounded-full p-2 focus:outline-none"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
        >
          <option value="1 day">1 Day</option>
          <option value="1 week">1 Week</option>
          <option value="1 month">1 Month</option>
          <option value="max">Max</option>
        </select>
        <ChevronDown className="cursor-pointer absolute top-3 right-10 w-5 h-5 text-gray-500" />
      </div>

      <div className="w-full h-[65vh]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name"/>
            <YAxis allowDecimals={false} />
            <Tooltip />
            {showBorrow && (
              <Line
                type="monotone"
                dataKey="borrow"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false} // Removes the points
              />
            )}
            {showLend && (
              <Line
                type="monotone"
                dataKey="lend"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={false}
              />
            )}
            {showDeposits && (
              <Line
                type="monotone"
                dataKey="deposit"
                stroke="#ff7300"
                strokeWidth={2}
                dot={false}
              />
            )}
            {showWithdrawals && (
              <Line
                type="monotone"
                dataKey="withdraw"
                stroke="#ffc658"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="md:px-8 px-2 mb-4 flex flex-wrap md:flex-row gap-4 md:gap-32 justify-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showBorrow}
            onChange={() => setShowBorrow(!showBorrow)}
          />
          <span className="ml-2">Borrow</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showLend}
            onChange={() => setShowLend(!showLend)}
          />
          <span className="ml-2">Lend</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showDeposits}
            onChange={() => setShowDeposits(!showDeposits)}
          />
          <span className="ml-2">Deposit</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showWithdrawals}
            onChange={() => setShowWithdrawals(!showWithdrawals)}
          />
          <span className="ml-2">Withdrawals</span>
        </label>
      </div>
    </div>
  );
};

export default AnalyticsChart;
