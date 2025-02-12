import React from "react";
import { InfoIcon } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { useAccount, useContractRead } from "@starknet-react/core";
import { TotalAssetsOverviewDisplay, UserAssetOverview } from "@/types";
import { formatCurrency, getCryptoPrices, TokentoHex } from "@/components/internal/helpers";
import { PROTOCOL_ADDRESS, ETH_SEPOLIA, STRK_SEPOLIA } from "@/components/internal/helpers/constant";
import protocolAbi from "../../../../public/abi/protocol.json";
import ProfilecardLoader from "../loaders/profilecardloader";

interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
}

const tokens: TokenInfo[] = [
  {
    symbol: "STRK",
    address: STRK_SEPOLIA,
    decimals: 18
  },
  {
    symbol: "ETH",
    address: ETH_SEPOLIA,
    decimals: 18
  }
];



const AllAssetsOverview: TotalAssetsOverviewDisplay[] = [
  { id: 'available_balance', label: 'Available Balance', value: '$0.0', info: 'Information about Available Balance' },
  { id: 'total_lent', label: 'Total Lend', value: '$0.0', info: 'Information about Total Lend' },
  { id: 'total_borrowed', label: 'Total Borrow', value: '$0.0', info: 'Information about Total Borrow' },
  { id: 'interest_earned', label: 'Interest Earned', value: '$0.0', info: 'Information about Interest Earned' },
];

const Dashboard = () => {
  const { address: user } = useAccount();
  
  const [totalAssetsOverview, setTotalAssetsOverview] = useState<UserAssetOverview>({
    available_balance: BigInt(0),
    interest_earned: BigInt(0),
    total_borrowed: BigInt(0),
    total_lent: BigInt(0),
  });

  const [usdValues, setUsdValues] = useState({ eth: 0, strk: 0 });
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      setIsLoadingPrices(true);
      setPriceError(null);
      try {
        const values = await getCryptoPrices();
        setUsdValues(values);
      } catch (error) {
        setPriceError('Failed to fetch crypto prices');
        console.error('Error fetching crypto prices:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    }
    fetchPrices();
  }, []);

  const { 
    data: userAssets, 
    isLoading, 
    isFetching 
  } = useContractRead(
    user ? {
      abi: protocolAbi,
      address: PROTOCOL_ADDRESS,
      functionName: "get_user_assets",
      args: [user],
    } : ({} as any)
  );

  // Process data whenever userDeposits changes
  useEffect(() => {
    if (userAssets && Array.isArray(userAssets)) {
      const newTotal = userAssets.reduce((pValue, currentValue) => {
        let tokenAddressHex = "";
        try {
          const address = currentValue.token_address?.toString();
          tokenAddressHex = TokentoHex(address);
        } catch (error) {
          console.error('Error converting token address to hex:', error);
        }
        
        const token = tokens.find(t => t.address === tokenAddressHex);
        const tokenPrice = token ? usdValues[token.symbol.toLowerCase() as 'eth' | 'strk'] : 0;
        
        const availableBalanceInUsd = token ? 
          Number(formatCurrency(currentValue.available_balance?.toString())) * tokenPrice : 0;
        
        const interestEarnedinUSD = token ? Number (formatCurrency(currentValue.interest_earned?.toString())) * tokenPrice : 0;
        const totalLentinUSD = token ? Number (formatCurrency(currentValue.total_lent?.toString()) * tokenPrice) : 0;
        const totalBorrowedinUSD = token ? Number (formatCurrency(currentValue.total_borrowed?.toString()) * tokenPrice) : 0;

        return {
          available_balance: pValue.available_balance + BigInt(Math.floor(availableBalanceInUsd * 100)), // Store as cents
          interest_earned: pValue.interest_earned + BigInt(Math.floor(interestEarnedinUSD * 100)|| 0),
          total_borrowed: pValue.total_borrowed + BigInt(Math.floor(totalBorrowedinUSD * 100) || 0),
          total_lent: pValue.total_lent + BigInt(Math.floor(totalLentinUSD * 100) || 0),
        };
      }, {
        available_balance: BigInt(0),
        interest_earned: BigInt(0),
        total_borrowed: BigInt(0),
        total_lent: BigInt(0),
      });

      setTotalAssetsOverview(newTotal);
    }
  }, [userAssets, usdValues]);

  if (isLoading || isFetching || isLoadingPrices) {
    return <ProfilecardLoader />;
  }

  return (
    <div className="border border-gray-200 rounded-[1rem] flex flex-col gap-6 md:p-6 p-2 bg-white w-full">
      <div className="flex flex-col md:flex-row md:flex-wrap gap-4 3xl:gap-[2rem] w-full">
        {AllAssetsOverview.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 p-6 rounded-xl mt-4 bg-[#efefef] relative flex flex-col justify-center w-full lg:w-[calc(51%-1rem)] 3xl:w-[48%]"
          >
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className="text-[2.2rem] font-semibold text-black pb-8">
              {item.id
                ? `$${(Number(totalAssetsOverview[item.id]) / 100).toFixed(2)}`
                : '$20'}
            </p>
            {item.info && (
              <InfoIcon 
                className="cursor-pointer absolute top-2 right-3 w-5 h-5 text-gray-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(Dashboard);