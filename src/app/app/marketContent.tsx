import Image from "next/image";
import React from "react";
import { MainMarketProps } from "../../data/mainMarket";

interface MarketContentProps {
  marketData: MainMarketProps[];
  onAction: (action: "Lend" | "Borrow", data: Partial<MainMarketProps>) => void;
}

const MarketContent: React.FC<MarketContentProps> = ({ marketData, onAction }) => {
  return (
    <div className="w-full flex flex-col gap-4 overflow-x-auto">
      {marketData.map((row, index) => (
        <div
          key={index}
          className="flex flex-row items-center md:items-start justify-between border-t border-gray-300 py-4 gap-4 md:gap-8 w-full"
        >
          {/* Asset Section */}
          <div className="flex flex-col md:flex-row items-center w-full md:w-1/5 gap-2 md:gap-4 px-4">
            <Image
              src={row.image}
              height={30}
              width={30}
              alt={row.asset}
            />
            <div className="text-center md:text-left">
              <span className="font-semibold text-lg">{row.asset}</span>
              <p className="text-xs text-gray-500">{row.price}</p>
            </div>
          </div>

          {/* Supply Section */}
          <div className="flex flex-col items-center md:w-1/5 text-center px-4">
            <div className="flex">
              <div>
                <p className="font-medium">{row.deposits}</p>
                <small className="text-gray-400">{row.maxTVL}</small>
              </div>
              {row.cap >= 70 && (
                <Image
                  src={row.cap >= 90 ? row.alert : row.caution}
                  height={20}
                  width={20}
                  alt={row.cap >= 90 ? "alert" : "caution"}
                />
              )}
            </div>
          </div>

          {/* Borrow Section */}
          <div className="flex flex-col items-center md:w-1/5 text-center px-4">
            <p className="font-medium">{row.deposits}</p>
            <small className="text-gray-400">{row.maxTVL}</small>
          </div>

          {/* Supply APY + Lend Button */}
          <div className="flex flex-col items-center md:w-1/5 text-center px-4 justify-center">
            <button
              className="px-2 py-1 text-sm rounded-full bg-black text-white w-20"
              onClick={() => onAction("Lend", row)}
            >
              Lend
            </button>
            <p className="mt-1">{row.supplyAPY}</p>
          </div>

          {/* Borrow APY + Borrow Button */}
          <div className="flex flex-col items-center md:w-1/5 text-center px-4 justify-center">
            <button
              className="px-2 py-1 text-sm rounded-full bg-black text-white w-20"
              onClick={() => onAction("Borrow", row)}
            >
              Borrow
            </button>
            <p className="mt-1">{row.borrowAPY}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketContent;
