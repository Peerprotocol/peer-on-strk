import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useAccount, useContractRead } from "@starknet-react/core";
import protocolAbi from "../../../../public/abi/protocol.json";
import {
  ETH_SEPOLIA,
  PROTOCOL_ADDRESS,
  STRK_SEPOLIA,
} from "@/components/internal/helpers/constant";
import STRK from "../../../../public/images/starknet.png";
import ETH from "../../../../public/images/ethereumlogo.svg";
import {
  TokentoHex,
  formatCurrency,
  getCryptoPrices,
  formatDate1,
  felt252ToHex,
  toHex,
  normalizeAddress,
} from "@/components/internal/helpers";
import AssetsLoader from "../loaders/assetsloader";
import RepayModal from "@/components/custom/RepayModal";
import Link from "next/link";

// Types
interface TokenInfo {
  symbol: string;
  address: string;
  icon: any;
  decimals: number;
}

// Constants
const ROWS_PER_PAGE = 15;
const TABS = ["Assets", "Position Overview", "Transaction History"] as const;
type TabType = (typeof TABS)[number];

const tokens: TokenInfo[] = [
  { symbol: "STRK", address: STRK_SEPOLIA, icon: STRK, decimals: 18 },
  { symbol: "ETH", address: ETH_SEPOLIA, icon: ETH, decimals: 18 },
];

const TRANSACTION_TYPE_MAP: { [key: string]: string } = {
  "19216509646883156": "DEPOSIT",
  "412198569506257514217804": "WITHDRAWAL",
};

const Table: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<TabType>("Transaction History");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usdValues, setUsdValues] = useState({ eth: 0, strk: 0 });
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<{
    id: any;
    amount: number;
  } | null>(null);
  // const [positionType, setPositionType] = useState<"borrow" | "lend">("borrow");

  // Contract Data Hooks
  const { address: user } = useAccount();

  const {
    data: userDeposits,
    isLoading: isLoadingUserDeposits,
    isFetching: isFetchingUserDeposits,
  } = useContractRead(
    user
      ? {
          abi: protocolAbi,
          address: PROTOCOL_ADDRESS,
          functionName: "get_user_deposits",
          args: [user],
        }
      : ({} as any)
  );

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    isFetching: isFetchingTransactions,
  } = useContractRead(
    user
      ? {
          abi: protocolAbi,
          address: PROTOCOL_ADDRESS,
          functionName: "get_transaction_history",
          args: [user, 1, ROWS_PER_PAGE],
        }
      : ({} as any)
  );

  const {
    data: borrowProposals,
    isLoading: isLoadingProposals,
    isFetching: isFetchingProposals,
  } = useContractRead(
    user
      ? {
          abi: protocolAbi,
          address: PROTOCOL_ADDRESS,
          functionName: "get_borrow_proposal_details",
          args: [],
        }
      : ({} as any)
  );

  const {
    data: lendingProposals,
    isLoading: isLoadinglendProposals,
    isFetching: isFetchinglendProposals,
  } = useContractRead(
    user
      ? {
          abi: protocolAbi,
          address: PROTOCOL_ADDRESS,
          functionName: "get_lending_proposal_details",
          args: [],
        }
      : ({} as any)
  );

  // Effects
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      setPriceError(null);
      try {
        const values = await getCryptoPrices();
        setUsdValues(values);
      } catch (error) {
        setPriceError("Failed to fetch crypto prices");
        console.error("Error fetching crypto prices:", error);
      } finally {
        setIsLoadingPrices(false);
      }
    };
    fetchPrices();
  }, []);

  const mergedProposals = useMemo(() => {
    if (!borrowProposals || !lendingProposals) {
      return [];
    }

    const allProposals = [...borrowProposals, ...lendingProposals];

    // Sort by timestamp in descending order
    allProposals.sort((a: any, b: any) => {
      return Number(b.timestamp) - Number(a.timestamp);
    });
    // i took the top 5
    return allProposals.slice(0, 5);
  }, [borrowProposals, lendingProposals]);

  // Data Processing
  const getDataForActiveTab = () => {
    switch (activeTab) {
      case "Transaction History":
        return Array.isArray(transactions) ? transactions : [];
      case "Assets":
        return Array.isArray(userDeposits) ? userDeposits : [];
      case "Position Overview":
        //  return Array.isArray(borrowProposals) ? borrowProposals : [];
        return mergedProposals;
      default:
        return [];
    }
  };

  const dataForCurrentTab = getDataForActiveTab();
  const totalPages = Math.ceil(dataForCurrentTab?.length / ROWS_PER_PAGE);
  const currentRows = getDataForActiveTab()
    ?.sort((a: any, b: any) => {
      //I Converted timestamps to numbers and sorted it in descending order (latest first)
      return Number(b.timestamp) - Number(a.timestamp);
    })
    ?.slice(
      (currentPage - 1) * ROWS_PER_PAGE,
      currentPage * ROWS_PER_PAGE
    );

  // Pagination Logic
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const maxVisibleButtons = 5;
  const startPage =
    Math.floor((currentPage - 1) / maxVisibleButtons) * maxVisibleButtons + 1;
  const endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);

  // Event Handlers
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Render Helper Functions
  const renderTokenInfo = (tokenAddress: string) => {
    let tokenAddressHex = "";
    try {
      tokenAddressHex = TokentoHex(tokenAddress);
    } catch (error) {
      console.error("Error converting token to hex:", error);
      return null;
    }

    const token = tokens.find((t) => t.address === tokenAddressHex);
    if (!token) return null;

    return (
      <div className="flex gap-3 items-center">
        <Image
          src={token.icon}
          width={20}
          height={20}
          alt={`${token.symbol} Token`}
        />
        <span>{token.symbol}</span>
      </div>
    );
  };

  const renderLoadingState = (colSpan: number) => (
    <tr>
      <td colSpan={colSpan} className="p-4 text-center">
        <AssetsLoader />
      </td>
    </tr>
  );

  const renderValue = (amount: string, token: TokenInfo | undefined) => {
    if (!token || priceError) return priceError;
    return (
      usdValues[token.symbol.toLowerCase() as "eth" | "strk"] *
      Number(formatCurrency(Number(amount)))
    ).toFixed(3);
  };

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="mb-6 flex justify-between mt-3 gap-4">
        <div className="flex flex-wrap md:flex-row space-x-2 md:space-x-4 items-center justify-between w-full">
          <div>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-full ${
                  activeTab === tab
                    ? "bg-black text-white"
                    : "bg-transparent text-black"
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {
          activeTab === "Position Overview" &&(
            <Link href="/dashboard/positions" className="text-black font-medium">
            View All
          </Link>
          )
        }
        </div>
        {/* commented out the remove the borrow and lending toggle */}
        {/* {activeTab === "Position Overview" && (
          <div className="relative">
            <select
              className="px-4 py-2 border rounded-full text-black pr-8 appearance-none"
              onChange={(e) =>
                setPositionType(e.target.value as "borrow" | "lend")
              } // Add this state handler
            >
              <option value="borrow">Borrow</option>
              <option value="lend">Lend</option>
            </select>
            <ChevronDown className="cursor-pointer absolute top-3 right-2 w-5 h-5 text-gray-500" />
          </div>
        )} */}
       
      </div>...
      {/* Assets Table */}
      {activeTab === "Assets" && (
        <div className="overflow-x-auto text-black my-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border bg-[#E5E5E5]">
                <th className="p-4 text-left border-b font-semibold">Token</th>
                <th className="p-4 text-left border-b font-semibold">
                  Quantity
                </th>
                <th className="p-4 text-left border-b font-semibold">
                  Value ($)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoadingUserDeposits ||
              isFetchingUserDeposits ||
              isLoadingPrices ? (
                renderLoadingState(3)
              ) : !currentRows || currentRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    No data available
                  </td>
                </tr>
              ) : (
                currentRows.map((row: any, index: number) => {
                  const tokenInfo = renderTokenInfo(row.token?.toString());
                  const token = tokens.find(
                    (t) => t.address === TokentoHex(row.token?.toString())
                  );

                  return (
                    <tr key={index}>
                      <td className="p-4 border-b border-l">{tokenInfo}</td>
                      <td className="p-4 border-b border-l">
                        {Number(formatCurrency(row.amount?.toString())).toFixed(
                          3
                        )}
                      </td>
                      <td className="p-4 border-b border-l">
                        {renderValue(row.amount?.toString(), token)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Transaction History Table */}
      {activeTab === "Transaction History" && (
        <div className="overflow-x-auto text-black my-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border bg-[#E5E5E5]">
                <th className="p-4 text-left border-b font-semibold">
                  Transaction Type
                </th>
                <th className="p-4 text-left border-b font-semibold">Token</th>
                <th className="p-4 text-left border-b font-semibold">
                  Quantity
                </th>
                <th className="p-4 text-left border-b font-semibold">Amount</th>
                <th className="p-4 text-left border-b font-semibold">
                  Timestamp
                </th>
                <th className="p-4 text-left border-b font-semibold">Hash</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoadingTransactions || isFetchingTransactions ? (
                renderLoadingState(6)
              ) : !currentRows || currentRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    No transaction history available
                  </td>
                </tr>
              ) : (
                currentRows.map((row: any, index: number) => {
                  const tokenInfo = renderTokenInfo(row.token.toString());
                  const token = tokens.find(
                    (t) => t.address === TokentoHex(row.token.toString())
                  );
                  const transaction_type = Object.keys(
                    row.transaction_type.variant
                  ).filter(
                    (key) =>
                      typeof row.transaction_type.variant[key] === "object" &&
                      row.transaction_type.variant[key] !== null
                  );

                  return (
                    <tr key={index}>
                      <td className="p-4 border-b border-l">
                        {transaction_type.toString()}
                      </td>
                      <td className="p-4 border-b border-l">{tokenInfo}</td>
                      <td className="p-4 border-b border-l">
                        {Number(formatCurrency(row.amount?.toString())).toFixed(
                          3
                        )}
                      </td>
                      <td className="p-4 border-b border-l">
                        ${renderValue(row.amount?.toString(), token)}
                      </td>
                      <td className="p-4 border-b border-l">
                        {formatDate1(row.timestamp?.toString())}
                      </td>
                      <td className="p-4 border-b border-l">
                        <a
                          href={`https://sepolia.voyager.online/tx/${felt252ToHex(
                            row.tx_hash
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-md"
                        >
                          See transaction...
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}...
      {/* Position Overview Table */}
      {activeTab === "Position Overview" && (
        <div className="overflow-x-auto text-black my-6">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border bg-[#E5E5E5]">
                <th className="px-2 py-4 text-left border-b font-semibold">
                  Asset
                </th>
                <th className="text-left border-b font-semibold">
                  <p className="mx-10 xl:mx-0">Expected Repayment Time</p>
                </th>
                <th className="text-left border-b font-semibold">
                  Interest Rate
                </th>
                {/* removed this section according to figma design  */}
                {/* <th className="text-left border-b font-semibold">
                  <p className="mx-10 xl:mx-0">Borrowed</p>
                </th> */}
                <th className="text-left border-b font-semibold">
                  <p className="mx-10 xl:mx-0">Amount</p>
                </th>
                <th className="text-left border-b font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoadingProposals ||
              isLoadinglendProposals ||
              isFetchinglendProposals ||
              isFetchingProposals ? (
                renderLoadingState(5)
              ) : (
                <>
                  {mergedProposals.map((row: any, index: number) => {
                    const tokenInfo = renderTokenInfo(row.token.toString());

                    return (
                      <tr key={index}>
                        <td className="p-4 border-b border-l">{tokenInfo}</td>
                        <td className="p-4 border-b border-l">
                          {formatDate1(row.repayment_date?.toString())}
                        </td>
                        <td className="p-4 border-b border-l">
                          {Number(row.interest_rate)}%
                        </td>
                        <td className="p-4 border-b border-l">
                          {Number(
                            formatCurrency(row.token_amount?.toString())
                          ).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Table;
