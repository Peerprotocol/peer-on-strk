"use client";
import React, { useState, useMemo, useEffect } from "react";
import BackButton from "../../../../public/images/back-button.svg";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import Nav from "../../../components/custom/Nav";
import Sidebar from "../../../components/custom/sidebar";
import { PROTOCOL_ADDRESS } from "@/components/internal/helpers/constant";
import { useContractRead, useAccount, useContractWrite, useContract } from "@starknet-react/core";
import protocolAbi from "../../../../public/abi/protocol.json";
import { normalizeAddress, toHex, TokentoHex } from "@/components/internal/helpers";
import { toast as toastify } from "react-toastify";
import { toast as hotToast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import NewProposalModal from "@/components/proposalModal";
import FilterBar from "@/components/custom/FilterBar";
import AssetsLoader from "../loaders/assetsloader";
import DepositTokenModal from "@/components/custom/DepositTokenModal";
import { CallData, uint256 } from "starknet";

type ModalType = "borrow" | "counter" | "lend";

const ITEMS_PER_PAGE = 5;
const TOKEN_ADDRESSES = {
  STRK: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
};

interface BorrowersMarketProps {
  defaultToken?: string;
}

// Header Component
const Header = ({ defaultToken }: { defaultToken: string }) => (
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
          src={`/icons/${defaultToken.toLowerCase()}.svg`}
          height={20}
          width={20}
          alt={`${defaultToken}-logo`}
        />
        <p className="text-xs">{defaultToken}</p>
      </div>
    </div>
  </div>
);

// Table Header Component
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

// Pagination Component
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

// Table Row Props Interface
interface TableRowProps {
  proposals: any[];
  onCounterProposal: (item: string) => void;
  totalUserbalance: bigint;
  onDeposit: (amount: number, tokenSymbol: string) => Promise<void>;
}

// Table Row Component
const TableRow = ({ proposals, onCounterProposal, totalUserbalance, onDeposit }: TableRowProps) => {
  const [loading, setLoading] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedProposalForLending, setSelectedProposalForLending] = useState<{
    id: string;
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

  const handleLend = async (proposalId: string, amount: string) => {
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
          calldata: [proposalId, "0"],
        }],
      });

      if (transaction?.transaction_hash) {
        toastify.info("Processing transaction...");
        toastify.success("Proposal Accepted");

        await Promise.all([
          fetch("/api/database/protocol-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              total_borrow: amount,
              total_lend: 0,
              total_p2p_deals: 1,
              total_value_locked: 0,
            }),
          }),
          fetch("/api/database/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_address: address,
              message: `Your borrowing proposal with Id ${proposalId} has been accepted`,
            }),
          }),
        ]);
      }
    } catch (error) {
      console.error("Error lending:", error);
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
        toastify.success("Proposal Cancelled");

        await Promise.all([
          fetch("/api/database/protocol-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              total_borrow: -amount,
              total_lend: 0,
              total_p2p_deals: -1,
              total_value_locked: 0,
            }),
          }),
          fetch("/api/database/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_address: address,
              message: `Your borrowing proposal ${proposalId} has been cancelled`,
            }),
          }),
        ]);
      }
    } catch (error) {
      console.error("Error cancelling:", error);
      toastify.error("Failed to cancel. Try again");
    } finally {
      setLoading(false);
    }
  };

  const handleDepositComplete = async (depositAmount: number, tokenSymbol: string) => {
    await onDeposit(depositAmount, tokenSymbol);
    setDepositModalOpen(false);
    
    if (selectedProposalForLending) {
      await handleLend(selectedProposalForLending.id, selectedProposalForLending.amount);
      setSelectedProposalForLending(null);
    }
  };

  const getTokenName = (tokenAddress: string): string => {
    const normalizedAddress = normalizeAddress(tokenAddress.toLowerCase());
    for (const [name, addr] of Object.entries(TOKEN_ADDRESSES)) {
      if (normalizeAddress(addr.toLowerCase()) === normalizedAddress) {
        return name;
      }
    }
    return "Unknown";
  };

  if (loading) return <AssetsLoader />;

  return (
    <>
      <div className="border-t border-gray-300 min-w-[800px] w-full">
        {proposals.length > 0 ? proposals
          .filter((item: any) => !item.is_cancelled && !item.is_accepted)
          .map((item: any, index: number) => {
            const tokenHex = toHex(item.token.toString());
            const isOwner = normalizeAddress(TokentoHex(item.borrower.toString())) === normalizeAddress(address);
            const lenderHex = isOwner ? "Me" : `${toHex(item.borrower.toString()).slice(0, 5)}..`;

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
                <div className="text-center px-4 py-6">
                  <p className="font-medium">{getTokenName(normalizeAddress(tokenHex))}</p>
                </div>
                <div className="text-center px-4 py-6">
                  <p className="font-medium">
                    {Number(item.token_amount / BigInt(10 ** 18)).toFixed(2)}
                  </p>
                </div>
                <div className="text-center px-4 py-6">
                  <p className="font-medium">$ {item.amount.toString()}</p>
                </div>
                <div className="text-center px-4 py-6">
                  <p className="font-medium">{item.interest_rate.toString()}%</p>
                </div>
                <div className="text-center px-4 py-6">
                  <p className="font-medium">{item.duration.toString()} days</p>
                </div>
                <div className="flex gap-4 justify-center items-center py-6">
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
                        onClick={() => handleLend(item.id.toString(), item.amount.toString())}
                      >
                        Lend
                      </button>
                      <button
                        className="px-3 py-2 text-sm rounded-full border border-black text-black bg-white hover:bg-gray-100 transition"
                        onClick={() => onCounterProposal(item.id.toString())}
                      >
                        Counter
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="flex justify-center items-center h-full my-[2rem]">
              <p className="text-gray-500">No proposals found</p>
            </div>
          )}
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
          text={'Please deposit at least 2x the amount you want to lend.'}
        />
      )}
    </>
  );
};

// Main BorrowersMarket Component
const BorrowersMarket = ({ defaultToken = 'STRK' }: BorrowersMarketProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string>("");
  const [modalType, setModalType] = useState<ModalType>("lend");
  const [title, setTitle] = useState("Create a Lending Proposal");
  const [filterOption, setFilterOption] = useState("token");
  const [filterValue, setFilterValue] = useState(defaultToken);
  const [totalUserAsset, setTotalUserAsset] = useState<bigint>(BigInt(0));
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const { address } = useAccount();
  const { contract: protocolContract } = useContract({
    abi: protocolAbi,
    address: PROTOCOL_ADDRESS,
  });

  // Contract reads
  const { data: userAssetData } = useContractRead(
    address ? {
      abi: protocolAbi,
      address: PROTOCOL_ADDRESS,
      functionName: "get_user_assets",
      args: [address],
      watch: true,
    } : ({} as any)
  );

  const { data } = useContractRead(
    address ? {
      abi: protocolAbi,
      address: PROTOCOL_ADDRESS,
      functionName: "get_borrow_proposal_details",
      args: [],
      watch: true,
    } : ({} as any)
  );

  // Contract writes
  const { writeAsync: depositCall } = useContractWrite({
    calls: [
      {
        contractAddress: TOKEN_ADDRESSES.STRK || TOKEN_ADDRESSES.ETH,
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

  useEffect(() => {
    if (userAssetData && Array.isArray(userAssetData)) {
      let sum = BigInt(0);
      userAssetData.forEach((item: any) => {
        sum += item.available_balance ?? BigInt(0);
      });
      setTotalUserAsset(sum);
    }
  }, [userAssetData]);

  function getUint256FromDecimal(decimalAmount: number, decimals: number) {
    const multiplied = decimalAmount * Math.pow(10, decimals);
    return uint256.bnToUint256(multiplied.toString());
  }

  async function handleDepositTransaction(amount: number, tokenSymbol: string) {
    if (!protocolContract) {
      hotToast.error("Wallet not connected");
      return;
    }

    try {
      const decimals = 18;
      const tokenAddress = tokenSymbol === "ETH" ? TOKEN_ADDRESSES.ETH : TOKEN_ADDRESSES.STRK;
      const amountUint256 = getUint256FromDecimal(amount, decimals);

      const tx = await depositCall({
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

      toastify.info("Processing deposit...");
      if (tx?.transaction_hash){

      await fetch("/api/database/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_address: address.address,
          token: tokenSymbol,
          amount,
          transaction_type: "deposit",
        }),
      });

      // Create notification
      await fetch("/api/database/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_address: address,
          message: `your deposit of $${amount} ${tokenSymbol} is successful`,
        }),
      });

      toastify.success("Deposit successful. You can now create or accept a proposal");
    }
    } catch (err: any) {
      hotToast.error(`Deposit failed: ${err.message}`);
    }
  }

  const getTokenName = (tokenAddress: string): string => {
    const normalizedAddress = normalizeAddress(tokenAddress.toLowerCase());
    for (const [name, addr] of Object.entries(TOKEN_ADDRESSES)) {
      if (addr.toLowerCase() === normalizedAddress) {
        return name;
      }
    }
    return "Unknown";
  };

  // Proposal filtering and pagination
  const validProposals = useMemo(() => {
    return Array.isArray(data) ? data.filter(
      (item: any) => !item.is_cancelled && !item.is_accepted
    ) : [];
  }, [data]);

  const filteredProposals = useMemo(() => {
    if (!validProposals || !filterValue) return validProposals;
    
    return validProposals.filter((item: any) => {
      const itemTokenSymbol = getTokenName(toHex(item.token.toString()));
      const itemAmount = parseFloat(item.amount.toString());
      const itemInterest = parseFloat(item.interest_rate.toString());
      const itemDuration = parseFloat(item.duration.toString());

      switch (filterOption.toLowerCase()) {
        case "token":
          return itemTokenSymbol.toLowerCase() === filterValue.toLowerCase();
        case "amount": {
          const userAmount = parseFloat(filterValue);
          return !isNaN(userAmount) && itemAmount === userAmount;
        }
        case "interestrate": {
          const userInterest = parseFloat(filterValue);
          return !isNaN(userInterest) && itemInterest === userInterest;
        }
        case "duration": {
          const userDuration = parseFloat(filterValue);
          return !isNaN(userDuration) && itemDuration === userDuration;
        }
        default:
          return true;
      }
    });
  }, [validProposals, filterOption, filterValue]);

  const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE);
  const currentPageProposals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProposals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProposals, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProposals]);

  useEffect(() => {
    setFilterOption("token");
    setFilterValue(defaultToken);
  }, [defaultToken]);

  const handleOpenModal = (type: ModalType, proposalId?: string) => {
    // Convert BigInt to decimal considering 18 decimals
    const userAssetInDecimal = Number(totalUserAsset) / Math.pow(10, 18);
    
    // Check if user has less than minimum required balance (e.g., 0.01)
    if (userAssetInDecimal < 0.01) {
      setDepositModalOpen(true);
      return;
    }

    setModalType(type);
    setModalOpen(true);
    if (proposalId) {
      setSelectedProposalId(proposalId);
    }
    setTitle(type === "counter" ? "Counter this Proposal" : "Create a Lending Proposal");
  };

  return (
    <main className="bg-[#F5F5F5]">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
          <Nav />
          <Header defaultToken={defaultToken} />

          <div className="relative hidden lg:block px-4">
            <FilterBar
              filterOption={filterOption}
              filterValue={filterValue}
              onOptionChange={setFilterOption}
              onValueChange={setFilterValue}
              defaultToken={defaultToken}
            />
            <button
              onClick={() => handleOpenModal("lend")}
              className="right-4 top-5 flex items-center gap-2 px-6 py-3 absolute rounded-3xl
                       bg-[#F5F5F5] text-black border border-[rgba(0,0,0,0.8)] 
                       font-light hover:bg-[rgba(0,0,0,0.8)] hover:text-white"
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

          <div className="overflow-x-auto text-black border mx-4 mb-4 rounded-xl">
            <TableHeader />
            <TableRow
              proposals={currentPageProposals}
              totalUserbalance={totalUserAsset}
              onCounterProposal={(proposalId) => handleOpenModal("counter", proposalId)}
              onDeposit={handleDepositTransaction}
            />
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
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
              onDeposit={handleDepositTransaction}
              text={''}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default BorrowersMarket;