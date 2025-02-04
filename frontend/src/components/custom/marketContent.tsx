import Image from "next/image";
import React from "react";

interface TokenMarketData {
  currentPrice: number;
  priceChange24h: number;
  totalSupply: number;
  symbol: string;
  address: string;
}

interface MarketContentProps {
  tokenData: TokenMarketData[];
  onAction: (action: "Lend" | "Borrow", data: Partial<TokenMarketData>) => void;
}

const MarketContent: React.FC<MarketContentProps> = ({ tokenData, onAction }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="w-full flex flex-col gap-4 overflow-x-auto px-6">
      {tokenData.map((token, index) => (
        <div
          key={index}
          className="flex flex-row items-center md:items-start justify-between border-t border-gray-300 py-4 gap-4 md:gap-8 w-full"
        >
          {/* Asset Section */}
          <div className="flex flex-col md:flex-row items-center w-full md:w-1/5 gap-2 md:gap-4 px-4">
            <Image
              src={`/icons/${token.symbol.toLowerCase()}.svg`}
              height={30}
              width={30}
              alt={token.symbol}
            />
            <div className="text-center md:text-left">
              <span className="font-semibold text-lg">{token.symbol}</span>
              <p className="text-xs text-gray-500">
                {formatPrice(token.currentPrice)}
                <span className={`ml-2 ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {token.priceChange24h.toFixed(2)}%
                </span>
              </p>
            </div>
          </div>

          {/* Supply Information */}
          <div className="flex flex-col items-center md:w-1/5 text-center px-4">
            <p className="font-medium">{formatPrice(token.totalSupply * token.currentPrice)}</p>
            <small className="text-gray-400">Total Supply Value</small>
          </div>

          {/* Market Price */}
          <div className="flex flex-col items-center md:w-1/5 text-center px-4">
            <p className="font-medium">{formatPrice(token.currentPrice)}</p>
            <small className="text-gray-400">Current Price</small>
          </div>

          {/* Supply APY + Lend Button */}
          <div className="flex flex-col items-center md:w-1/5 text-center px-4 justify-center">
            <button
              className="px-2 py-1 text-sm rounded-full bg-black text-white w-20"
              onClick={() => onAction("Borrow", token)}
            >
              Lend
            </button>
          </div>

          {/* Borrow APY + Borrow Button */}
          <div className="flex flex-col items-center md:w-1/5 text-center px-4 justify-center">
            <button
              className="px-2 py-1 text-sm rounded-full bg-black text-white w-20"
              onClick={() => onAction("Lend", token)}
            >
              Borrow
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketContent;