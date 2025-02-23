"use client";
import React, { useState, useMemo, useEffect } from "react";
import BackButton from "../../../../public/images/back-button.svg";
import Link from "next/link";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import Nav from "../../../components/custom/Nav";
import Sidebar from "../../../components/custom/sidebar";
import { PROTOCOL_ADDRESS } from "@/components/internal/helpers/constant";
import { useContractRead } from "@starknet-react/core";
import protocolAbi from "../../../../public/abi/protocol.json";
import { normalizeAddress, toHex } from "@/components/internal/helpers";
import { useAccount } from "@starknet-react/core";
import { useContractWrite } from "@starknet-react/core";
import { toast as toastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewProposalModal from "@/components/proposalModal";
import { TokentoHex } from "../../../components/internal/helpers/index";
import FilterBar from "@/components/custom/FilterBar";
import AssetsLoader from "../loaders/assetsloader";

type ModalType = "borrow" | "counter" | "lend";

//Constants
const ITEMS_PER_PAGE = 5;
const TOKEN_ADDRESSES = {
  STRK: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
};

// -------------------------
// Table Header
// -------------------------
const TableHeader = () => (
  <div className="grid grid-cols-7 pt-6 rounded-t-xl bg-smoke-white py-4 min-w-[800px]">
    <div className="text-center font-semibold">Borrower</div>
    <div className="text-center font-semibold">Token</div>
    <div className="text-center font-semibold">Quantity</div>
    <div className="text-center font-semibold">Net Value</div>
    <div className="text-center font-semibold">Interest Rate</div>
    <div className="text-center font-semibold">Duration</div>
    <div className="text-center font-semibold">Actions</div>
  </div>
);

// -------------------------
// Table Row
// -------------------------
interface TableRowProps {
  proposals: any[];
  onCounterProposal: (item: string) => void;
}

const TableRow = ({ proposals, onCounterProposal }: TableRowProps) => {
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  const { write: lend, isLoading: isLendLoading } = useContractWrite({
    calls: [
      {
        abi: protocolAbi,
        contractAddress: PROTOCOL_ADDRESS,
        entrypoint: "accept_proposal",
        calldata: [],
      },
    ],
  });

  const handleLend = async (proposalId: any, amount: any) => {
    setLoading(true);
    try {
      const transaction = await lend({
        calls: [
          {
            abi: protocolAbi,
            contractAddress: PROTOCOL_ADDRESS,
            entrypoint: "accept_proposal",
            calldata: [proposalId, "0"],
          },
        ],
      });

      if (transaction?.transaction_hash) {
        toastify.success("Proposal Accepted");
        await transaction.wait();

        // Record transaction in DB
        await fetch("/api/database/protocol-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            total_borrow: amount,
            total_lend: 0,
            total_p2p_deals: 1,
            total_interest_earned: 0,
            total_value_locked: 0,
          }),
        });

        // Add notification
        await fetch("/api/database/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_address: address,
            message: `Your borrowing proposal ${proposalId} has been accepted`,
          }),
        });

        console.log("Transaction completed!");
      }
    } catch (error) {
      console.error("Error borrowing:", error);
      toastify.error("Failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const { write: cancel } = useContractWrite({
    calls: [
      {
        abi: protocolAbi,
        contractAddress: PROTOCOL_ADDRESS,
        entrypoint: "cancel_proposal",
        calldata: [],
      },
    ],
  });

  const cancelProposal = async (proposalId: any, amount: any) => {
    setLoading(true);
    try {
      const transaction = await cancel({
        calls: [
          {
            abi: protocolAbi,
            contractAddress: PROTOCOL_ADDRESS,
            entrypoint: "cancel_proposal",
            calldata: [proposalId, "0"],
          },
        ],
      });

        toastify.success("Proposal Cancelled");

        // Wait for transaction
        // await transaction.wait();

        // Record transaction in DB
        await fetch("/api/database/protocol-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            total_borrow: -amount,
            total_lend: 0,
            total_p2p_deals: -1,
            total_interest_earned: 0,
            total_value_locked: 0,
          }),
        });

        // Add notification
        await fetch("/api/database/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_address: address,
            message: `Your borrowing proposal ${proposalId} has been cancelled`,
          }),
        });

    } catch (error) {
      console.error("Error borrowing:", error);
      toastify.error("Failed. Try again");
    } finally {
      setLoading(false);
    }
  };

  const getTokenName = (tokenAddress: string): string => {
    const normalizedAddress = tokenAddress.toLowerCase();
    for (const [name, addr] of Object.entries(TOKEN_ADDRESSES)) {
      if (addr.toLowerCase() === normalizedAddress) {
        return name;
      }
    }
    return "Unknown";
  };

  return (
    <>
    {loading ? (
      <AssetsLoader />
    ) : (
<div className="border-t border-gray-300 min-w-[800px] w-full">
      {proposals
        .filter((item: any) => !item.is_cancelled && !item.is_accepted)
        .map((item: any, index: number) => {
          const tokenHex = toHex(item.token.toString());
          const isOwner = normalizeAddress(TokentoHex(item.borrower.toString())) === normalizeAddress(address);
          let lenderHex = toHex(item.borrower.toString());

          if (isOwner) {
            lenderHex = "Me";
          }

          return (
            <div key={index} className="grid grid-cols-7">
              {/* Borrower */}
              <div className="flex items-center justify-center px-4 py-6">
                <Image
                  src="/images/phantom-icon.svg"
                  height={20}
                  width={20}
                  alt="phantomicon"
                  className="h-5 w-5"
                />
                <p className="font-medium ml-2">{`${lenderHex.slice(
                  0,
                  5
                )}..`}</p>
              </div>

              {/* Token */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">{getTokenName(tokenHex)}</p>
              </div>

              {/* Quantity */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">
                  {Number(item.token_amount / BigInt(10 ** 18)).toFixed(2)}
                </p>
              </div>

              {/* Net Value */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">$ {item.amount.toString()}</p>
              </div>

              {/* Interest Rate */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">{item.interest_rate.toString()}%</p>
              </div>

              {/* Duration */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">{item.duration.toString()} days</p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center items-center py-6">
              {isOwner ? (
                    <button
                      className="px-4 py-2 text-sm rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition"
                      onClick={() => cancelProposal(item.id.toString(), item.amount.toString())}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  ) : (
                    <>
                <button
                  className={`px-4 py-2 text-sm rounded-full text-white ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-opacity-90 transition"
                  }`}
                  onClick={() =>
                    handleLend(item.id.toString(), item.amount.toString())
                  }
                  disabled={loading}
                >
                  {loading ? "..." : "Lend"}
                </button>
                </>
                  )}
              </div>
            </div>
          );
        })}
    </div>
    )}
    </>
  );
};

// -------------------------
// Pagination
// -------------------------

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex justify-end p-4">
    <div className="flex gap-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          className={`px-4 py-2 ${
            currentPage === index + 1
              ? "bg-[rgba(0,0,0,0.8)] text-white"
              : "bg-[#F5F5F5] text-black border-black border"
          } rounded-lg`}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  </div>
);
// -------------------------
// Main BorrowersMarket
// -------------------------
const BorrowersMarket = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string>("");
  const [modalType, setModalType] = useState<ModalType>("lend");
  const [title, setTitle] = useState("Create a Lending Proposal");

  // SINGLE-TOGGLE FILTER:
  const [filterOption, setFilterOption] = useState("token");
  const [filterValue, setFilterValue] = useState("");

  // Read proposals from contract
  const { address } = useAccount();
  const { data } = useContractRead(
    address
      ? {
          abi: protocolAbi,
          address: PROTOCOL_ADDRESS,
          functionName: "get_borrow_proposal_details",
          args: [],
          watch: true,
        }
      : ({} as any)
  );

  // All proposals
  const allProposals = Array.isArray(data) ? data : [];

  // Exclude canceled/accepted
  const validProposals = allProposals.filter(
    (item: any) => !item.is_cancelled && !item.is_accepted
  );

  // Utility to convert token address to short symbol
  const getTokenSymbol = (tokenAddress: string): string => {
    const normalizedAddress = tokenAddress.toLowerCase();
    for (const [symbol, addr] of Object.entries(TOKEN_ADDRESSES)) {
      if (addr.toLowerCase() === normalizedAddress) {
        return symbol;
      }
    }
    return "Unknown";
  };

  // Filter Proposals based on selected filterOption
  const filteredProposals = useMemo(() => {
    if (!filterValue) {
      return validProposals;
    }

    return validProposals.filter((item: any) => {
      const itemTokenSymbol = getTokenSymbol(toHex(item.token.toString()));
      const itemAmount = parseFloat(item.amount.toString());
      const itemInterest = parseFloat(item.interest_rate.toString());
      const itemDuration = parseFloat(item.duration.toString());

      switch (filterOption) {
        case "token":
          return itemTokenSymbol.toLowerCase() === filterValue.toLowerCase();
        case "amount": {
          const userAmount = parseFloat(filterValue);
          if (isNaN(userAmount)) return false;
          return itemAmount === userAmount;
        }
        case "interestRate": {
          const userInterest = parseFloat(filterValue);
          if (isNaN(userInterest)) return false;
          return itemInterest === userInterest;
        }
        case "duration": {
          const userDuration = parseFloat(filterValue);
          if (isNaN(userDuration)) return false;
          return itemDuration === userDuration;
        }
        default:
          return true;
      }
    });
  }, [validProposals, filterOption, filterValue]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE);

  // Slice for current page
  const currentPageProposals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProposals.slice(startIndex, endIndex);
  }, [filteredProposals, currentPage]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProposals]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const openModal = (type: ModalType, proposalId?: string) => {
    setModalType(type);
    setSelectedProposalId(proposalId || "");
    setModalOpen(true);
    setTitle(
      type === "counter" ? "Counter this Proposal" : "Create a Lending Proposal"
    );
  };

  return (
    <main className="bg-[#F5F5F5]">
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
          <Nav />

          {/* Page Title & Back Button */}
          <div className="flex justify-left items-center gap-3 p-4">
            <Link href="/dashboard">
              <Image
                src={BackButton}
                height={40}
                width={40}
                alt="back-button"
                className="cursor-pointer"
              />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-black text-2xl md:text-4xl">
                Borrowers Market
              </h1>
              <div className="flex gap-2 border rounded-3xl text-black border-gray-500 px-3 py-1 items-center">
                <Image
                  src="/images/starknet.png"
                  height={20}
                  width={20}
                  alt="starknet-logo"
                />
                <p className="text-xs">Starknet</p>
              </div>
            </div>
          </div>

          {/* Single-Filter Bar */}
          <div className="mx-4 mb-4 relative hidden lg:block">
            <FilterBar
              filterOption={filterOption}
              filterValue={filterValue}
              onOptionChange={(opt) => setFilterOption(opt)}
              onValueChange={(val) => setFilterValue(val)}
            />
            <button
              onClick={() => openModal("lend")}
              className=" flex items-center gap-2 px-6 py-3 rounded-3xl absolute
                       bg-[#F5F5F5] text-black border border-[rgba(0,0,0,0.8)] 
                       mx-auto font-light hover:bg-[rgba(0,0,0,0.8)] hover:text-white top-[1.6em] right-2"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <p>Create a Lending Proposal</p>
              <Plus
                size={22}
                strokeWidth={3}
                absoluteStrokeWidth
                className={`transition-colors duration-300 ease-in-out ${
                  isHovered ? "text-white" : "text-black"
                }`}
              />
            </button>
          </div>
          <div className="mx-4 mb-4 flex-col items-center block lg:hidden">
            <button
              onClick={() => openModal("lend")}
              className=" flex items-center gap-2 px-6 py-3 rounded-3xl 
                       bg-[#F5F5F5] text-black border border-[rgba(0,0,0,0.8)] 
                       mx-auto font-light hover:bg-[rgba(0,0,0,0.8)] hover:text-white "
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <p>Create a Lending Proposal</p>
              <Plus
                size={22}
                strokeWidth={3}
                absoluteStrokeWidth
                className={`transition-colors duration-300 ease-in-out ${
                  isHovered ? "text-white" : "text-black"
                }`}
              />
            </button>
            <FilterBar
              filterOption={filterOption}
              filterValue={filterValue}
              onOptionChange={(opt) => setFilterOption(opt)}
              onValueChange={(val) => setFilterValue(val)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto text-black border mx-4 mb-4 rounded-xl">
            <TableHeader />
            <TableRow
              proposals={currentPageProposals}
              onCounterProposal={(proposalId) =>
                openModal("counter", proposalId)
              }
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* Modal */}
          <NewProposalModal
            type={modalType}
            show={isModalOpen}
            onClose={() => setModalOpen(false)}
            title={title}
            proposalId={selectedProposalId}
          />
        </div>
      </div>
    </main>
  );
};

export default BorrowersMarket;