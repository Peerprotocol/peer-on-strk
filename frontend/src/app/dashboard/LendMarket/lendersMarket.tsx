"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useContractWrite } from "@starknet-react/core";
import { Plus, X } from "lucide-react";
import Nav from "../../../components/custom/Nav";
import Sidebar from "../../../components/custom/sidebar";
import { PROTOCOL_ADDRESS } from "@/components/internal/helpers/constant";
import { useContractRead } from "@starknet-react/core";
import protocolAbi from "../../../../public/abi/protocol.json";
import { toHex } from "@/components/internal/helpers";
import { toast as toastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewProposalModal from "@/components/proposalModal";
import { CallData } from "starknet";

// Constants
const ITEMS_PER_PAGE = 7;
const TOKEN_ADDRESSES = {
  STRK: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
};

// Types
type ModalType = "lend" | "counter" | "borrow";

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
            className=""
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
    <div className="text-center font-semibold">Quantity</div>
    <div className="text-center font-semibold">Net Value</div>
    <div className="text-center font-semibold">Interest Rate</div>
    <div className="text-center font-semibold">Duration</div>
    <div className="text-center font-semibold">Actions</div>
  </div>
);

interface TableRowProps {
  onCounter: () => void;
}

const TableRow = ({ onCounter }: TableRowProps) => {
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

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

  // Ensure data is an array
  const lendingProposals = Array.isArray(data) ? data : [];

  const { write: lend, isLoading: isLendLoading } = useContractWrite({
    calls: [
      {
        abi: protocolAbi,
        contractAddress: PROTOCOL_ADDRESS,
        entrypoint: "accept_proposal",
        calldata: [], // This will be filled when calling
      },
    ],
  });

  const handleLend = async (proposalId: bigint) => {
    console.log("proposal id", proposalId);
    setLoading(true);
    try {
      const transaction = await lend({
        calls: [
          {
            abi: protocolAbi,
            contractAddress: PROTOCOL_ADDRESS,
            entrypoint: "accept_proposal",
            calldata: CallData.compile(["0", BigInt(proposalId)]),
          },
        ],
      });

      if (transaction?.transaction_hash) {
        toastify.success("Proposal Accepted");
        console.log("Transaction submitted:", transaction.transaction_hash);

        // Wait for transaction
        await transaction.wait();
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
        calldata: [], // This will be filled when calling
      },
    ],
  });

  const cancelProposal = async (proposalId: any) => {
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

      if (transaction?.transaction_hash) {
        console.log("Transaction submitted:", transaction.transaction_hash);
        toastify.success("Proposal Cancelled");

        // Wait for transaction
        await transaction.wait();
        console.log("Transaction completed!");
      }
    } catch (error) {
      console.error("Error borrowing:", error);
      toastify.error("Failed. Try again");
    } finally {
      setLoading(false);
    }
  };

  const getTokenName = (tokenAddress: string): string => {
    const normalizedAddress = tokenAddress.toLowerCase();
    for (const [name, address] of Object.entries(TOKEN_ADDRESSES)) {
      if (address.toLowerCase() === normalizedAddress) {
        return name;
      }
    }
    return "Unknown";
  };

  return (
    <div className="border-t border-gray-300 min-w-[800px] w-full">
      {lendingProposals
        .filter(
          (item: any) => item.is_cancelled !== true && item.is_accepted !== true
        )
        .map((item: any, index: number) => {
          const tokenHex = toHex(item.token.toString());
          let lenderHex = toHex(item.lender.toString());

          if (item.lender == address) {
            lenderHex = "Me";
          }

          return (
            <div key={index} className="grid grid-cols-7">
              {/* Merchant Column */}
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

              {/* Token Column */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">{getTokenName(tokenHex)}</p>
              </div>

              {/* Quantity Column */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">{Number(item.token_amount / BigInt(10 ** 18)).toFixed(2)}</p>
              </div>

              {/* Net Value Column */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">
                $ {item.amount.toString()}  
                </p>
              </div>

              {/* Interest Rate Column */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">{item.interest_rate.toString()}%</p>
              </div>

              {/* Duration Column */}
              <div className="text-center px-4 py-6">
                <p className="font-medium">{item.duration.toString()} days</p>
              </div>

              {/* Actions Column */}
              <div className="flex gap-4 justify-center items-center py-6">
                <button
                  className={`px-4 py-2 text-sm rounded-full text-white ${
                    loading || proposalsLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-opacity-90 transition"
                  }`}
                  onClick={() => handleLend(item.id.toString())}
                  disabled={loading || proposalsLoading}
                >
                  {loading ? "..." : "Borrow"}
                </button>

                <Image
                  src="/images/edit.svg"
                  alt="counter-proposal"
                  width={20}
                  height={20}
                  className={`cursor-pointer ${
                    loading || proposalsLoading
                      ? "opacity-50"
                      : "hover:opacity-80"
                  }`}
                  onClick={() => !loading && !proposalsLoading && onCounter()}
                />

                <X onClick={() => cancelProposal(item.id.toString())} />
              </div>
            </div>
          );
        })}
    </div>
  );
};

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

// Main Lender Component
const Lender = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("borrow");
  const [title, setTitle] = useState("Create a Borrow Proposal");

  const totalPages = Math.ceil(5 / ITEMS_PER_PAGE);

  const handleOpenModal = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);

    if (type === "counter") {
      setTitle("Create a Counter Proposal");
    }
  };

  return (
    <main className="bg-[#F5F5F5] backdrop-blur-sm">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
          <Nav />
          <Header />
          <div className="overflow-x-auto text-black border border-gray-300 mx-4 mb-4">
            <TableHeader />
            <div className="w-full">
              <TableRow onCounter={() => handleOpenModal("counter")} />
            </div>
          </div>

          <button
            onClick={() => handleOpenModal("borrow")}
            className="relative flex items-center gap-2 px-6 py-3 rounded-3xl bg-[#F5F5F5] text-black border border-[rgba(0,0,0,0.8)] mx-auto font-light hover:bg-[rgba(0,0,0,0.8)] hover:text-white"
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          <NewProposalModal
            type={modalType}
            show={isModalOpen}
            onClose={() => setModalOpen((prev) => !prev)}
            title={title}
          />
        </div>
      </div>
    </main>
  );
};

export default Lender;
