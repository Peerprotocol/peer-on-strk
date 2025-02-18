import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MarketContent from "./marketContent";
import { ChevronDown } from "lucide-react";
import { PROTOCOL_ADDRESS, ETH_SEPOLIA, STRK_SEPOLIA } from "@/components/internal/helpers/constant";
import ProtcolBorrow from "./ProtocolBorrow";

interface TokenMarketData {
  currentPrice: number;
  priceChange24h: number;
  totalSupply: number;
  symbol: string;
  address: string;
}

interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  coingeckoId?: string;
}


interface TokenMarketData {
  currentPrice: number;
  priceChange24h: number;
  totalSupply: number;
  symbol: string;
  address: string;
}

const tokens: TokenInfo[] = [
  {
    symbol: "STRK",
    address: STRK_SEPOLIA,
    decimals: 18,
    coingeckoId: "starknet"
  },
  {
    symbol: "ETH",
    address: ETH_SEPOLIA,
    decimals: 18,
    coingeckoId: "ethereum"
  }
];


const Market = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Main Market");
  const [Protocol, setProtocol] = useState<"Protocol" | "P2P">("P2P");
  const [tokenData, setTokenData] = useState<TokenMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"Deposit" | "Borrow">("Deposit");
  const [selectedCoin, setSelectedCoin] = useState({
    asset: "",
    image: "",
    balance: 0,
  });

  const options = ["Main Market", "Meme Market"];

  const handleSelectChange = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const openModal = (
    type: "Deposit" | "Borrow",
    data: Partial<TokenMarketData>
  ) => {
    setModalType(type);
    setSelectedCoin({
      asset: data.symbol || "",
      image: data.symbol || "",
      balance: data.currentPrice || 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAction = (
    action: "Lend" | "Borrow",
    data: Partial<TokenMarketData>
  ) => {
    if (Protocol === "P2P") {
      if (action === "Lend") {
        router.push(`dashboard/LendMarket`);
      } else if (action === "Borrow") {
        router.push(`dashboard/BorrowMarket`);
      }
    } else {
      openModal(action as "Deposit" | "Borrow", data);
    }
  };


  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const fetchedData = await Promise.all(
          tokens.map(async (token) => {
            if (!token.coingeckoId) return null;

            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/${token.coingeckoId}?localization=false&tickers=false&community_data=false&developer_data=false`
            );

            const data = await response.json();

            return {
              symbol: token.symbol,
              address: token.address,
              currentPrice: data.market_data.current_price.usd,
              priceChange24h: data.market_data.price_change_percentage_24h,
              totalSupply: data.market_data.total_supply
            };
          })
        );

        setTokenData(fetchedData.filter((data): data is TokenMarketData => data !== null));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching token data:", error);
        setIsLoading(false);
      }
    };

    fetchTokenData();
    const interval = setInterval(fetchTokenData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="p-2 md:p-8">
      <div className="relative text-left flex flex-col md:flex-row justify-evenly md:justify-between pt-20 pb-8">
        <p className="text-black text-3xl">Main Market</p>

        <div className="flex items-center gap-8">
          <div className="flex gap-1 bg-gray-200 rounded-full px-1 py-1">
            <div
              className={` text-black flex gap-3 py-2 px-4 border cursor-pointer ${Protocol === "Protocol" ? "text-white bg-black rounded-full" : ""
                }`}
              onClick={() => setProtocol("Protocol")}
            >
              <p>Protocol</p>
            </div>
            <div
              className={` text-black flex gap-3 py-2 px-4 border cursor-pointer ${Protocol === "P2P" ? "text-white bg-black rounded-full" : ""
                }`}
              onClick={() => setProtocol("P2P")}
            >
              <p>P2P</p>
            </div>
          </div>

          <button
            type="button"
            className="flex justify-between gap-2 items-center w-full rounded-full border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedOption}
            <ChevronDown size={16} />
          </button>
          {isOpen && (
            <div className="origin-top-right absolute right-0 mt-32 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelectChange(option)}
                    className={`flex items-center w-full px-4 py-2 text-sm ${option === selectedOption
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-black border rounded-t-xl w-full overflow-x-auto bg-white">
        <div className="flex gap-12 justify-between pt-6 rounded-t-xl bg-[#E5E5E5] py-4 w-full px-4 overflow-auto">
          <p className="text-center font-semibold w-auto md:w-1/5">Asset</p> 
          <p className="text-center font-semibold w-auto md:w-1/5"> Total Supply</p>
          <p className="text-center font-semibold w-auto md:w-1/5">Price</p>
          <p className="text-center font-semibold w-auto md:w-1/5"></p>
          <p className="text-center font-semibold w-auto md:w-1/5"></p>
        </div>

        <MarketContent
          tokenData={Protocol === "Protocol" ? tokenData : tokenData}
          onAction={handleAction}
        />
      </div>

      {isModalOpen && (
        <ProtcolBorrow
          type={modalType}
          availableBalance={selectedCoin.balance}
          currencyIcon={selectedCoin.image}
          currencyName={selectedCoin.asset}
          onClose={closeModal}
          onSubmit={(amount) => {
            console.log(`${modalType} Amount:`, amount);
            closeModal();
          }}
        />
      )}
    </div>
  );
};

export default Market;
