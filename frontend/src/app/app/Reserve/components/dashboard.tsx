import { ChevronDownIcon, CogIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Dropdown from "./dropdown";
import ReserveChart from "./chart";
import History from "./history/history";

interface TokenInfo {
  tokenReserved: {
    symbol: string;
    address: string;
    decimals: number;
    icon: string;
    balance: number;
    availableLiquidity: string;
    supply: string;
    utilization: string;
    totalBorrowed: string;
  };
}

const Dashboard: React.FC<TokenInfo> = ({ tokenReserved }) => {
  const coinMetricsData = [
    {
      label: `${tokenReserved.symbol} Supplied`,
      value: tokenReserved.supply,
    },
    {
      label: "Available liquidity",
      value: tokenReserved.availableLiquidity,
    },
    {
      label: "Utilization",
      value: tokenReserved.utilization,
    },
    {
      label: "Total Borrowed",
      value: tokenReserved.totalBorrowed,
    },
  ];

  const options = [
    { label: "Supply", value: "supply" },
    { label: "Borrow", value: "borrow" },
  ];

  const borrowInfo = [
    {
      label: "Total Supplied",
      value: "20.43M",
    },
    {
      label: "Borrow APY",
      value: "30%",
    },
    {
      label: "Borrow Cap",
      value: "53.02%",
    },
  ];

  const liquiditationInfo = [
    {
      label: "Max LTV",
      value: "10.00%",
    },
    {
      label: "Liquidation LTV",
      value: "30.34%",
    },
  ];

  const [selectedProtocol, setSelectedProtocol] = useState(options[0].label);
  const [inputBalance, setInputBalance] = useState(0);

  const handleDropdownChange = (value: string) => {
    setSelectedProtocol(value);
  };

  const balancePercentages = Array.from({ length: 4 }, (_, index) => ({
    percentage: (index + 1) * 25,
  }));

  const handlePercentageClick = (percentage: number) => {
    const balance = tokenReserved.balance;
    const newAmount = (balance * percentage) / 100;
    setInputBalance(newAmount);
  };

  const handleProtocolSubmit = () => {
    console.log("Protocol submitted:", selectedProtocol);
    console.log("Input balance:", inputBalance);
  };

  const MetricCard = ({ label, value }: { label: string; value: string }) => (
    <div className="relative flex flex-col justify-center bg-black/10 w-[290px] h-[150px] rounded-2xl pl-4 lg:pl-6">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-black font-normal text-2xl md:text-4xl pt-2 animate-fadeInBottom">
        {value}
      </p>
    </div>
  );

  return (
    <>
      <div className="flex text-black items-center gap-3 mb-6">
        <div
          onClick={() => window.history.back()}
          className="cursor-pointer w-10 h-10 border border-black rounded-full flex items-center justify-center"
        >
          <span className="w-5 font-semibold">&larr;</span>
        </div>
        <h1 className="md:text-3xl md:font-semibold">
          {tokenReserved.symbol} Reserve
        </h1>
        <span className="py-1 px-3 flex items-center gap-1 text-sm text-black/50 rounded-3xl border border-black/50">
          <Image
            src={tokenReserved.icon}
            alt={tokenReserved.symbol}
            width={20}
            height={20}
          />
          {tokenReserved.symbol}
        </span>
      </div>
      <div className="flex flex-col md:flex-row gap-4 lg:gap-8 w-full md:justify-between">
        <div className="bg-white border rounded-[20px] max-w-[650px] h-[412px] grid grid-cols-2 gap-3 py-5 px-5">
          {coinMetricsData.map((metric, index) => (
            <MetricCard key={index} label={metric.label} value={metric.value} />
          ))}
        </div>
        <div className="bg-white border rounded-[20px] w-[402px] h-[412px] p-4">
          <div className="w-fit ml-auto">
            <Dropdown
              options={options}
              selected={selectedProtocol}
              selectedClassname="bg-white text-black border border-black"
              dropdownClassname="bg-white text-black border border-black"
              onSelect={handleDropdownChange}
            />
          </div>
          <br />
          <hr />
          <br />
          <div className="w-[368px] h-[239px] rounded-[10px] bg-black/5 p-3">
            <div className="w-full flex justify-between">
              <h4 className="text-xs font-normal text-black">Your supply</h4>
              <div className="flex flex-col text-[8px] gap-1 leading-3 font-normal text-black">
                <span className="text-right">Priority fee</span>
                <p className="inline-flex justify-center items-center gap-1 w-[88px] h-[21px] rounded-3xl bg-black/10">
                  Minimum <CogIcon size={15} />
                </p>
              </div>
            </div>
            <br />
            <div className="flex justify-between relative mt-5 md:mt-8">
              <button
                type="button"
                className="inline-flex py-2 px-2 rounded-[10px] max-w-[121px] items-center gap-1 bg-black/10 text-black font-semibold text-sm lg:text-xl"
              >
                <Image
                  src={tokenReserved.icon}
                  alt={tokenReserved.symbol}
                  width={20}
                  height={20}
                />
                {tokenReserved.symbol}
                <ChevronDownIcon />
              </button>
              <label htmlFor="amount" className="relative w-48 h-[21px]">
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  placeholder="0"
                  dir="rtl"
                  maxLength={8}
                  onChange={(e) => setInputBalance(parseFloat(e.target.value))}
                  className="w-full bg-transparent outline-none focus:outline-none text-xl lg:text-3xl font-semibold text-black/50"
                />
              </label>
            </div>
            <br />
            <p className="text-black font-normal text-sm mb-2">
              Available: {tokenReserved.balance}
            </p>
            <div className="w-full inline-flex gap-1 justify-end">
              {balancePercentages.map((percentage, index) => (
                <span
                  key={index}
                  className="inline-flex rounded-sm w-[31px] h-5 items-center justify-center bg-black/10 text-black font-normal text-[8px]"
                  onClick={() => handlePercentageClick(percentage.percentage)}
                >
                  {percentage.percentage}%
                </span>
              ))}
            </div>
          </div>
          <p
            className="h-[42px] bg-black rounded-3xl text-base w-full inline-flex items-center justify-center mt-3"
            onClick={handleProtocolSubmit}
          >
            {selectedProtocol}
          </p>
        </div>
      </div>
      <br />
      <section className="bg-white w-full border rounded-[20px] p-5 flex flex-col gap-4 lg:gap-8">
        <ReserveChart />
        <hr />
        <h4 className="font-semibold text-base lg:text-xl text-black">Borrow Info</h4>
        <div className="bg-white max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {borrowInfo.map((metric, index) => (
            <MetricCard key={index} label={metric.label} value={metric.value} />
          ))}
        </div>
        <hr />
        <h4 className="font-semibold text-base lg:text-xl text-black">Liquidation Info</h4>
        <div className="bg-white max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {liquiditationInfo.map((metric, index) => (
            <MetricCard key={index} label={metric.label} value={metric.value} />
          ))}
        </div>
      </section>
      <br />
      <History />
    </>
  );
};

export default Dashboard;
