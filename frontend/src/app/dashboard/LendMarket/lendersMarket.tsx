"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useAccount,
  useContractWrite,
  useContractRead,
  useContract,
} from "@starknet-react/core";
import { Plus } from "lucide-react";
import Nav from "../../../components/custom/Nav";
import Sidebar from "../../../components/custom/sidebar";
import { PROTOCOL_ADDRESS } from "@/components/internal/helpers/constant";
import protocolAbi from "../../../../public/abi/protocol.json";
import { normalizeAddress, toHex, TokentoHex } from "@/components/internal/helpers";
import { toast as toastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewProposalModal from "@/components/proposalModal";
import { CallData, uint256 } from "starknet";
import FilterBar from "@/components/custom/FilterBar";
import AssetsLoader from "../loaders/assetsloader";
import DepositTokenModal from "@/components/custom/DepositTokenModal";
import { toast as hotToast } from "react-hot-toast";

// Constants
const ITEMS_PER_PAGE = 5;
const TOKEN_ADDRESSES = {
  STRK: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
};

// Component for the header section
const Header = () => (
  <div className="flex p-4">
    <div className="flex gap-3 justify-center items-center">
      <Link href="/dashboard">
        <Image
          src="/images/back-button.svg"
          height={40}
          width={40}
          alt="back-button"
          className="cursor-pointer"
        />
      </Link>
      <div className="flex gap-2 pb-2">
        <p className="text-black text-xl md:text-2xl lg:text-4xl">
          Lenders Market
        </p>
        <div className="flex gap-2 border rounded-3xl text-black border-gray-500 w-24 items-center justify-center">
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
  </div>
);

// Component for the table header
const TableHeader = () => (
  <div className="grid grid-cols-7 pt-6 rounded-t-xl bg-smoke-white py-4 min-w-[800px]">
    <div className="text-center font-semibold">Lender</div>
    <div className="text-center font-semibold">Token</div>
    <div className="text-center font-semibold">Amount</div>
    <div className="text-center font-semibold">Value</div>
    <div className="text-center font-semibold">Interest Rate</div>
    <div className="text-center font-semibold">Duration</div>
    <div className="text-center font-semibold">Actions</div>
  </div>
);

interface TableRowProps {
  onCounter: (item: string) => void;
  totalUserbalance: bigint;
  proposals: any[];
  onDeposit: (amount: number, tokenSymbol: string) => Promise<void>;
}

const TableRow = ({ proposals, totalUserbalance, onCounter, onDeposit }: TableRowProps) => {
  const [loading, setLoading] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedProposalForLending, setSelectedProposalForLending] = useState<{
    id: bigint;
    amount: string;
  } | null>(null);
  const { address } = useAccount();

  const { write: lend } = useContractWrite({
    calls: [{
      abi: protocolAbi,
      contractAddress: PROTOCOL_ADDRESS,
      entrypoint: "accept_proposal",
      calldata: [],
    }],
  });

  const handleLend = async (proposalId: bigint, amount: string) => {
    if (totalUserbalance < BigInt(amount)) {
      setSelectedProposalForLending({ id: proposalId, amount });
      setDepositModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const transaction = await lend({
        calls: [{
          abi: protocolAbi,
          contractAddress: PROTOCOL_ADDRESS,
          entrypoint: "accept_proposal",
          calldata: CallData.compile([proposalId, "0"]),
        }],
      });

      if (transaction?.transaction_hash) {
        toastify.info("Processing transaction...");
        await transaction.wait();
        toastify.success("Proposal Accepted");

        await Promise.all([
          fetch("/api/database/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_address: address,
              message: `Your lending proposal with Id ${proposalId} has been accepted`,
            }),
          }),
          fetch("/api/database/protocol-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              total_borrow: 0,
              total_lend: amount,
              total_p2p_deals: 1,
              total_interest_earned: 0,
              total_value_locked: 0,
            }),
          }),
        ]);
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      toastify.error("Failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const { write: cancel } = useContractWrite({
    calls: [{
      abi: protocolAbi,
      contractAddress: PROTOCOL_ADDRESS,
      entrypoint: "cancel_proposal",
      calldata: [],
    }],
  });

  const cancelProposal = async (proposalId: string, amount: string) => {
    setLoading(true);
    try {
      const transaction = await cancel({
        calls: [{
          abi: protocolAbi,
          contractAddress: PROTOCOL_ADDRESS,
          entrypoint: "cancel_proposal",
          calldata: [proposalId, "0"],
        }],
      });

      if (transaction?.transaction_hash) {
        toastify.info("Processing cancellation...");
        await transaction.wait();
        toastify.success("Proposal Cancelled");

        await Promise.all([
          fetch("/api/database/protocol-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              total_borrow: 0,
              total_lend: -amount,
              total_p2p_deals: -1,
              total_interest_earned: 0,
              total_value_locked: 0,
            }),
          }),
          fetch("/api/database/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_address: address,
              message: `Your lending proposal ${proposalId} has been cancelled`,
            }),
          }),
        ]);
      }
    } catch (error) {
      console.error("Error cancelling proposal:", error);
      toastify.error("Failed to cancel. Try again");
    } finally {
      setLoading(false);
    }
  };

  const handleDepositComplete = async (depositAmount: number, tokenSymbol: string) => {
    await onDeposit(depositAmount, tokenSymbol);
    setDepositModalOpen(false);
    
    // If this was for a specific lending action, retry it
    if (selectedProposalForLending) {
      await handleLend(selectedProposalForLending.id, selectedProposalForLending.amount);
      setSelectedProposalForLending(null);
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

  if (loading) return <AssetsLoader />;

  return (
    <>
      <div className="border-t border-gray-300 min-w-[800px] w-full">
        {proposals.map((item: any, index: number) => {
          const tokenHex = toHex(item.token.toString());
          const isOwner = normalizeAddress(TokentoHex(item.lender.toString())) === normalizeAddress(address);
          const lenderHex = isOwner ? "Me" : `${toHex(item.lender.toString()).slice(0, 5)}..`;
          
          return (
            <div key={index} className="grid grid-cols-7 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-center px-4 py-6">
                <Image
                  src="/images/phantom-icon.svg"
                  height={20}
                  width={20}
                  alt="phantomicon"
                  className="h-5 w-5"
                />
                <p className="font-medium ml-2">{lenderHex}</p>
              </div>
              <div className="text-center px-2 py-6">
                <p className="font-medium">{getTokenName(normalizeAddress(tokenHex))}</p>
              </div>
              <div className="text-center px-2 py-6">
                <p className="font-medium">
                  {Number(item.token_amount / BigInt(10 ** 18)).toFixed(2)}
                </p>
              </div>
              <div className="text-center px-2 py-6">
                <p className="font-medium">$ {item.amount.toString()}</p>
              </div>
              <div className="text-center px-4 py-6">
                <p className="font-medium">{item.interest_rate.toString()}%</p>
              </div>
              <div className="text-center px-4 py-6">
                <p className="font-medium">{item.duration.toString()} days</p>
              </div>
              <div className="flex gap-2 justify-center items-center py-6">
                {isOwner ? (
                  <button
                    className="px-4 py-2 text-sm rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition"
                    onClick={() => cancelProposal(item.id.toString(), item.amount.toString())}
                  >
                    Cancel
                  </button>
                ) : (
                  <>
                    <button
                      className="px-4 py-2 text-sm rounded-full text-white bg-black hover:bg-opacity-90 transition"
                      onClick={() => handleLend(item.id, item.amount.toString())}
                    >
                      Borrow
                    </button>
                    <button
                      className="px-3 py-2 text-sm rounded-full border border-black text-black bg-white hover:bg-gray-100 transition"
                      onClick={() => onCounter(item.id.toString())}
                    >
                      Counter
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {depositModalOpen && (
        <DepositTokenModal
          isOpen={depositModalOpen}
          onClose={() => {
            setDepositModalOpen(false);
            setSelectedProposalForLending(null);
          }}
          walletAddress={address || ""}
          onDeposit={handleDepositComplete}
          text={'Please deposit at least 2x the amount you want to borrow for enough collateral'}
        />
      )}
    </>
  );
};

// Main Lender Component
const Lender = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string>("");
  const [modalType, setModalType] = useState<"lend" | "counter" | "borrow">("borrow");
  const [title, setTitle] = useState("Create a Borrow Proposal");
  const [totalUserAsset, setTotalUserAsset] = useState<bigint>(BigInt(0));
  const [filterOption, setFilterOption] = useState("token");
  const [filterValue, setFilterValue] = useState("");

  const { address } = useAccount();

  function getUint256FromDecimal(decimalAmount: number, decimals: number) {
    const multiplied = decimalAmount * Math.pow(10, decimals);
    return uint256.bnToUint256(multiplied.toString());
  }

  const { contract: protocolContract } = useContract({
    abi: protocolAbi,
    address: PROTOCOL_ADDRESS,
  });

  const { writeAsync: depositCall } = useContractWrite({
    calls: [
      {
        contractAddress: TOKEN_ADDRESSES.STRK,
        entrypoint: "approve",
        calldata: [],
      },
      {
        contractAddress: PROTOCOL_ADDRESS,
        entrypoint: "deposit",
        calldata: [],
      },
    ],
  });

  async function handleDepositTransaction(amount: number, tokenSymbol: string) {
    if (!protocolContract) {
      hotToast.error("Wallet not connected");
      return;
    }

    try {
      const decimals = 18;
      const tokenAddress = tokenSymbol === "ETH" ? TOKEN_ADDRESSES.ETH : TOKEN_ADDRESSES.STRK;
      const amountUint256 = getUint256FromDecimal(amount, decimals);

      await depositCall({
        calls: [
          {
            contractAddress: tokenAddress,
            entrypoint: "approve",
            calldata: [PROTOCOL_ADDRESS, amountUint256.low, amountUint256.high],
          },
          {
            contractAddress: PROTOCOL_ADDRESS,
            entrypoint: "deposit",
            calldata: [tokenAddress, amountUint256.low, amountUint256.high],
          },
        ],
      });

      await fetch("/api/database/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_address: address,
          token: tokenSymbol,
          amount,
          transaction_type: "deposit",
        }),
      });

      toastify.success("Deposit successful");
    } catch (err: any) {
      hotToast.error(`Deposit failed: ${err.message}`);}
    }
  
    const { data: userAssetData } = useContractRead(
      address
        ? {
            abi: protocolAbi,
            address: PROTOCOL_ADDRESS,
            functionName: "get_user_assets",
            args: [address],
            watch: true,
          }
        : ({} as any)
    );
  
    useEffect(() => {
      if (userAssetData && Array.isArray(userAssetData)) {
        let sum = BigInt(0);
        userAssetData.forEach((item: any) => {
          sum += item.available_balance ?? BigInt(0);
        });
        setTotalUserAsset(sum);
      }
    }, [userAssetData]);
  
    const { data, isLoading: proposalsLoading } = useContractRead(
      address
        ? {
            abi: protocolAbi,
            address: PROTOCOL_ADDRESS,
            functionName: "get_lending_proposal_details",
            args: [],
            watch: true,
          }
        : ({} as any)
    );
  
    const lendingProposals = Array.isArray(data) ? data : [];
  
    const validProposals = useMemo(() => {
      return lendingProposals.filter(
        (item: any) => !item.is_cancelled && !item.is_accepted
      );
    }, [lendingProposals]);
  
    const getTokenName = (tokenAddress: string): string => {
      const normalizedAddress = tokenAddress.toLowerCase();
      for (const [name, addr] of Object.entries(TOKEN_ADDRESSES)) {
        if (addr.toLowerCase() === normalizedAddress) {
          return name;
        }
      }
      return "Unknown";
    };
  
    const filteredProposals = useMemo(() => {
      if (!filterValue) return validProposals;
      return validProposals.filter((item: any) => {
        const itemTokenSymbol = getTokenName(toHex(item.token.toString()));
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
  
    const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE);
    
    const paginatedProposals = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredProposals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProposals, currentPage]);
  
    function handleOpenModal(type: "lend" | "counter" | "borrow", proposalId?: string) {
      if (totalUserAsset <= BigInt(0)) {
        setDepositModalOpen(true);
        return;
      }
      setModalType(type);
      setModalOpen(true);
      if (proposalId) {
        setSelectedProposalId(proposalId);
      }
      if (type === "counter") {
        setTitle("Counter this Proposal");
      }
    }
  
    return (
      <main className="bg-[#F5F5F5] backdrop-blur-sm">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
            <Nav />
            <Header />
  
            <div className="relative hidden lg:block px-4">
              <FilterBar
                filterOption={filterOption}
                filterValue={filterValue}
                onOptionChange={(opt) => setFilterOption(opt)}
                onValueChange={(val) => setFilterValue(val)}
              />
              <button
                onClick={() => handleOpenModal("borrow")}
                className="right-4 top-5 flex items-center gap-2 px-6 py-3 absolute rounded-3xl bg-[#F5F5F5] text-black border border-[rgba(0,0,0,0.8)] font-light hover:bg-[rgba(0,0,0,0.8)] hover:text-white"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <p>Create a Borrow Proposal</p>
                <Plus
                  size={22}
                  strokeWidth={4}
                  color={isHovered ? "#fff" : "#000"}
                  className="transition-opacity duration-300 ease-in-out"
                />
              </button>
            </div>
  
            <div className="overflow-x-auto text-black border mx-4 mb-4 rounded-xl">
              <TableHeader />
              <TableRow
                proposals={paginatedProposals}
                totalUserbalance={totalUserAsset}
                onCounter={(proposalId) => handleOpenModal("counter", proposalId)}
                onDeposit={handleDepositTransaction}
              />
            </div>
  
            {totalPages > 1 && (
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
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
  
            <NewProposalModal
              type={modalType}
              show={isModalOpen}
              onClose={() => setModalOpen(false)}
              title={title}
              proposalId={selectedProposalId}
            />
  
            {depositModalOpen && (
              <DepositTokenModal
                isOpen={depositModalOpen}
                onClose={() => setDepositModalOpen(false)}
                walletAddress={address || ""}
                onDeposit={async (depositAmount: number, tokenSymbol: string) => {
                  await handleDepositTransaction(depositAmount, tokenSymbol);
                }}
                text={''}
              />
            )}
          </div>
        </div>
      </main>
    );
  };
  
  export default Lender;