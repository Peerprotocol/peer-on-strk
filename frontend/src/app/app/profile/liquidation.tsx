import { InfoIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { PROTOCOL_ADDRESS, ETH_SEPOLIA, STRK_SEPOLIA } from "@/components/internal/helpers/constant";
import { useAccount, useContractRead } from "@starknet-react/core";
import protocolAbi from "../../../../public/abi/protocol.json";
import { getCryptoPrices} from "@/components/internal/helpers";

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

interface TokenBalance {
    symbol: string;
    balance: string;
    balanceUsd: number;
}

const Liquidation = () => {
    const { address } = useAccount();
    const [balances, setBalances] = useState<TokenBalance[]>([]);
    const [totalBalance, setTotalBalance] = useState("0.00");
    const [isLoading, setIsLoading] = useState(true);
    const [usdValues, setUsdValues] = useState({ eth: 0, strk: 0 });
    const [isLoadingPrices, setIsLoadingPrices] = useState(false);
    const [priceError, setPriceError] = useState<string | null>(null);

    // Fetch crypto prices
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

    const strkContract = useContractRead(
        address ? {
            abi: protocolAbi,
            address: PROTOCOL_ADDRESS,
            functionName: "get_locked_funds",
            args: [address, STRK_SEPOLIA],
            watch: true,
        } : ({} as any)
    );

    const ethContract = useContractRead(
        address ? {
            abi: protocolAbi,
            address: PROTOCOL_ADDRESS,
            functionName: "get_locked_funds",
            args: [address, ETH_SEPOLIA],
            watch: true,
        } : ({} as any)
    );

    useEffect(() => {
        const calculateBalances = async () => {
            if (!address) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const newBalances: TokenBalance[] = [];
                let totalUsd = 0;

                // Handle STRK balance
                if (strkContract.data) {
                    const balance = Number(strkContract.data.toString());
                    const balanceUsd = balance * usdValues.strk;
                    totalUsd += balanceUsd;
                    newBalances.push({
                        symbol: 'STRK',
                        balance: balance.toFixed(2),
                        balanceUsd
                    });
                }

                // Handle ETH balance
                if (ethContract.data) {
                    const balance = Number(ethContract.data.toString());
                    const balanceUsd = balance * usdValues.eth;
                    totalUsd += balanceUsd;
                    newBalances.push({
                        symbol: 'ETH',
                        balance: balance.toFixed(2),
                        balanceUsd
                    });
                }

                setBalances(newBalances);
                setTotalBalance(totalUsd.toFixed(2));
            } catch (error) {
                console.error('Error calculating balances:', error);
            } finally {
                setIsLoading(false);
            }
        };

        calculateBalances();
    }, [address, strkContract.data, ethContract.data, usdValues]);

    const isContractLoading = strkContract.loading || ethContract.loading;

    const Loader = () =>{
        return(
            <div
            className="border border-gray-200 p-6 rounded-xl mt-4 bg-smoke-white relative flex flex-col justify-center w-full lg:w-[calc(51%-1rem)] 3xl:w-[48%]"
          >
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
            
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse mb-8"></div>
            
            <div className="absolute top-2 right-3 w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        )
    }

    return (
        <div className="border border-gray-200 rounded-[1rem] flex flex-col md:flex-row justify-between gap-6 md:p-6 p-2 bg-white w-[95%] mx-auto mb-8">
            <div className="border border-gray-200 p-6 rounded-xl bg-smoke-white relative flex flex-col justify-center w-full lg:w-[calc(48%-1rem)] h-[160px]">
                {(isLoading || isContractLoading || isLoadingPrices) ? (
                    <Loader />
                ) : (
                    <>
                        <p className="text-sm text-gray-400">Locked Balance</p>
                        <p className="text-[2.2rem] font-semibold text-black">
                            ${totalBalance}
                        </p>
                        
                        <div className="mt-4 space-y-2">
                            {balances.map((token) => (
                                <div key={token.symbol} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{token.symbol}</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-black">{token.balance} {token.symbol}</span>
                                        <span className="text-gray-500 text-xs">
                                            ${token.balanceUsd.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <InfoIcon className="cursor-pointer absolute top-2 right-3 w-5 h-5 text-gray-500" />
                    </>
                )}
            </div>

            <div className="border border-gray-200 p-6 rounded-xl bg-smoke-white relative flex flex-row items-center justify-between gap-8 w-full lg:w-[calc(53%-1rem)] min-h-[160px]">
                <div className="flex flex-col items-start w-1/3 place-self-start text-left">
                <p className="text-sm text-gray-400">Liquidation Check</p>
                        <p className="text-[2.2rem] font-semibold text-black">
                            False
                        </p>
                </div>
                <div className="w-[110px] h-full bg-black rounded-full flex items-center justify-center">
                    <div className="w-[85%] h-[85%] rounded-full bg-white">

                    </div>
                </div>
                <InfoIcon className="cursor-pointer absolute top-2 right-3 w-5 h-5 text-gray-500" />
            </div>
        </div>
    );
};

export default Liquidation;