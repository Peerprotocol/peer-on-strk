"use client";
import BackButton from "../../../../public/images/back-button.svg";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import Nav from "../Nav";
import Sidebar from "../sidebar";
import { PROTOCOL_ADDRESS } from "@/components/internal/helpers/constant";
import { useContractRead } from "@starknet-react/core";
import protocolAbi from "../../../../public/abi/protocol.json";
import { toHex } from "@/components/internal/helpers";
import { useAccount } from "@starknet-react/core";
import { useContractWrite } from "@starknet-react/core";
import { toast as toastify } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type ModalType = "create" | "counter";

interface ProposalData {
  quantity: string;
  duration: string;
  interestRate: number;
  token: string;
  collateral: string;
}

//Constants
const ITEMS_PER_PAGE = 7;
const TOKEN_ADDRESSES = {
  STRK: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
}

// Component for the table header
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

interface TableRowProps {
  onCounterProposal: () => void;
}

const TableRow = ({ onCounterProposal }: TableRowProps) => {
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  const { data, isLoading: proposalsLoading } = useContractRead(
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

  // Ensure data is an array
  const lendingProposals = Array.isArray(data) ? data : [];

  const { write: lend, isLoading: isLendLoading } = useContractWrite({
    calls: [
      {
        abi: protocolAbi,
        contractAddress: PROTOCOL_ADDRESS,
        entrypoint: "accept_proposal",
        calldata: [], // This will be filled when calling
      }
    ],
  });
  
  const handleLend = async (proposalId: any) => {
    setLoading(true);
    try {
      const transaction = await lend({
        calls: [{
          abi: protocolAbi,
          contractAddress: PROTOCOL_ADDRESS,
          entrypoint: "accept_proposal",
          calldata: [proposalId, "0"]
        }]
      });
      
      if (transaction?.transaction_hash) {
        toastify.success('Proposal Accepted')
        console.log("Transaction submitted:", transaction.transaction_hash);
        
        // Wait for transaction
        await transaction.wait();
        console.log("Transaction completed!");
      }
    } catch (error) {
      console.error("Error borrowing:", error);
      toastify.error('Failed. Try again!')
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
      }
    ],
  });
  
  const cancelProposal = async (proposalId: any) => {
    setLoading(true);
    try {
      const transaction = await cancel({
        calls: [{
          abi: protocolAbi,
          contractAddress: PROTOCOL_ADDRESS,
          entrypoint: "cancel_proposal",
          calldata: [proposalId, "0"]
        }]
      });
      
      if (transaction?.transaction_hash) {
        console.log("Transaction submitted:", transaction.transaction_hash);
        toastify.success('Proposal Cancelled')
        
        // Wait for transaction
        await transaction.wait();
        console.log("Transaction completed!");
      }
    } catch (error) {
      console.error("Error borrowing:", error);
      toastify.error('Failed. Try again')
    } finally {
      setLoading(false);
    }
  };

  const getTokenName = (tokenAddress: string): string => {
    const normalizedAddress = tokenAddress.toLowerCase();
    for (const [name, address] of Object.entries(TOKEN_ADDRESSES)) {
      if (address.toLowerCase() === normalizedAddress) {
        return name; // Return token name if matched
      }
    }
    return "Unknown";
  };
  
  return (
    <div className="border-t border-gray-300 min-w-[800px] w-full">
     {lendingProposals
        .filter((item: any) => item.is_cancelled !== true && item.is_accepted !== true)
        .map((item: any, index: number) => {
          const tokenHex = toHex(item.token.toString());
          const lenderHex = toHex(item.lender.toString());

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
              <p className="font-medium ml-2">{`${lenderHex.slice(0, 5)}..`}</p>
            </div>

            {/* Token Column */}
            <div className="text-center px-4 py-6">
              <p className="font-medium">{getTokenName(tokenHex)}</p>
            </div>

            {/* Quantity Column */}
            <div className="text-center px-4 py-6">
              <p className="font-medium">{item.amount.toString()}</p>
            </div>

            {/* Net Value Column */}
            <div className="text-center px-4 py-6">
              <p className="font-medium">{item.required_collateral_value.toString()}</p>
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
                {loading ? "..." : "Lend"}
              </button>

              <Image
                src="/images/edit.svg"
                alt="counter-proposal"
                width={20}
                height={20}
                className={`cursor-pointer ${
                  loading || proposalsLoading ? "opacity-50" : "hover:opacity-80"
                }`}
                onClick={() => !loading && !proposalsLoading && onCounterProposal()}
              />
              <X onClick={() => cancelProposal(item.id.toString())} />
            </div>
          </div>
        );
      })}
    </div>
  );
};



// Component for the proposal form in modal
interface ProposalFormProps {
  interestRate: number;
  interestRateInput: string;
  onInterestRateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onManualInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  formData: ProposalData;
  setFormData: (data: ProposalData) => void;
}

const ProposalForm = ({
  interestRate,
  interestRateInput,
  onInterestRateChange,
  onManualInputChange,
  formData,
  setFormData,
}: ProposalFormProps) => {
  const getTokenAddress = (tokenName: string) => {
    const upperToken = tokenName.toUpperCase();
    return TOKEN_ADDRESSES[upperToken as keyof typeof TOKEN_ADDRESSES] || tokenName;
  };

  // Modified onChange handlers
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tokenName = e.target.value;
    const tokenAddress = getTokenAddress(tokenName);
    setFormData({ ...formData, token: tokenAddress });
  };

  const handleCollateralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const collateralName = e.target.value;
    const collateralAddress = getTokenAddress(collateralName);
    setFormData({ ...formData, collateral: collateralAddress });
  };

  return (
  <div className="space-y-4 px-10 py-6">
    <div>
        <label className="text-sm text-gray-500 pl-2">Token to Lend</label>
        <div className="p-3 border rounded-xl border-gray-600">
          <input
            type="text"
            className="w-full outline-none pl-2 text-black"
            placeholder="STARK"
            value={formData.token}
            onChange={handleTokenChange}
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-500 pl-2">Collateral</label>
        <div className="p-3 border rounded-xl border-gray-600">
          <input
            type="text"
            className="w-full outline-none pl-2 text-black"
            placeholder="STARK"
            value={formData.collateral}
            onChange={handleCollateralChange}
          />
        </div>
      </div>

    <div>
      <label className="text-sm text-gray-500 pl-2">Quantity</label>
      <div className="p-3 border rounded-xl border-gray-600">
        <input
          type="text"
          className="w-full outline-none pl-2 text-black"
          placeholder="0"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
        />
      </div>
    </div>

    <div>
      <label className="text-sm text-gray-500 pl-2">Duration (Days)</label>
      <div className="p-3 border rounded-xl border-gray-600">
        <input
          type="text"
          className="w-full outline-none pl-2 text-black"
          placeholder="0"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
        />
      </div>
    </div>

    <div>
      <label className="text-sm text-gray-500 pl-2">Interest Rate (%)</label>
      <div className="flex flex-col items-center text-black">
        <input
          type="range"
          min="0"
          max="100"
          value={interestRate}
          onChange={onInterestRateChange}
          className="w-full h-2 rounded-lg cursor-pointer appearance-none focus:outline-none"
          style={{
            background: `linear-gradient(to right, #1e1e1e ${interestRate}%, #e0e0e0 ${interestRate}%)`,
          }}
        />
        <div className="flex justify-between w-full text-black">
          <span className="text-black font-medium">{interestRate}%</span>
          <input
            type="text"
            value={interestRateInput + '%'}
            onChange={onManualInputChange}
            className="border border-gray-300 mt-2 rounded p-1 w-16 text-center focus:outline-none focus:ring-0 focus:border-gray-400"
            placeholder="Rate"
          />
        </div>
      </div>
    </div>
  </div>
);
};


const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
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
          className={`px-4 py-2 ${currentPage === index + 1
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

// Modal Component
interface ProposalModalProps {
  isOpen: boolean;
  ModalType: ModalType;
  onClose: () => void;
  interestRate: number;
  interestRateInput: string;
  onInterestRateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onManualInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProposalModal = ({
  isOpen,
  ModalType,
  onClose,
  interestRate,
  interestRateInput,
  onInterestRateChange,
  onManualInputChange,
}: ProposalModalProps) => {
  const { account } = useAccount();
  const [formData, setFormData] = useState<ProposalData>({
    token: "",
    collateral: "",
    quantity: "",
    duration: "",
    interestRate: 1,
  });

  const collateral_amount = Math.floor(Number(formData.quantity) * 1.3);

  const { writeAsync: createBorrowProposal, isLoading: isBorrowLoading } = useContractWrite({
    calls: {
        contractAddress: PROTOCOL_ADDRESS,
        entrypoint: "create_borrow_proposal",
        calldata: [
          `${formData.token}`,
          `${formData.collateral}`,
           `${formData.quantity}`,
           "0",
            `${collateral_amount}`,
            "0",
            `${formData.interestRate}`,
            `${formData.duration}`
        ]
    }
});

  const handleSubmit = async () => {
    try {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      const isBorrowProposal = ModalType === "create";
      const transaction = isBorrowProposal
        && await createBorrowProposal();

      console.log(`${isBorrowProposal && "Borrow"} proposal created:`, transaction);
      onClose();
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg h-auto p-4 sm:p-8 relative">
        <button
          className="absolute top-4 right-4 text-black text-2xl sm:text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-center text-lg sm:text-xl text-black mb-4">
          {ModalType === "create" ? "Create a Proposal" : "Counter Proposal"}
        </h2>

        <ProposalForm
          interestRate={interestRate}
          interestRateInput={interestRateInput}
          onInterestRateChange={onInterestRateChange}
          onManualInputChange={onManualInputChange}
          formData={formData}
          setFormData={setFormData}
        />

        <div className="flex justify-center mt-6 mb-5">
          <button
            className="bg-[rgba(0,0,0,0.8)] text-white px-6 py-2 rounded-md text-sm sm:text-base"
            onClick={handleSubmit}
            disabled={isBorrowLoading}
          >
            {isBorrowLoading ? "Submitting..." : "Submit"}
          </button>
        </div>

        <div className="flex items-center gap-2 justify-center absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <small className="text-gray-500 text-xs sm:text-sm">
            Powered By Peer Protocol
          </small>
          <Image
            src="/images/LogoBlack.svg"
            height={20}
            width={20}
            alt="peer-protocol-logo"
            className="opacity-50"
          />
        </div>
      </div>
    </div>
  );
};

const BorrowersMarket = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("create");
  const [interestRate, setInterestRate] = useState(0);
  const [interestRateInput, setInterestRateInput] = useState("");

  const totalPages = Math.ceil(5 / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const openModal = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
    setInterestRate(0);
    setInterestRateInput("");
  };
  const closeModal = () => setModalOpen(false);

  const handleInterestRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setInterestRate(value);
    setInterestRateInput(event.target.value);
  };

  const handleManualInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInterestRateInput(value);
    setInterestRate(Number(value));
  };

  return (
    <main className="bg-[#F5F5F5]">
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
          <Nav />
          <div className="flex justify-left items-center gap-3 p-4">
            <Link href="/app">
              <Image src={BackButton} height={40} width={40} alt="back-button" className="cursor-pointer" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-black text-2xl md:text-4xl">Borrowers Market</h1>
              <div className="flex gap-2 border rounded-3xl text-black border-gray-500 px-3 py-1 items-center">
                <Image src="/images/starknet.png" height={20} width={20} alt="starknet-logo" />
                <p className="text-xs">Starknet</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto text-black border mx-4 mb-4 rounded-xl">
            <TableHeader />
            <div>
            
                <TableRow onCounterProposal={() => openModal("counter")} />
              
            </div>
          </div>
          <button
            onClick={() => openModal("create")}
            className="relative flex items-center gap-2 px-6 py-3 rounded-3xl bg-[#F5F5F5] text-black border border-[rgba(0,0,0,0.8)] mx-auto font-light hover:bg-[rgba(0,0,0,0.8)] hover:text-white"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <p>Create a Proposal</p>
            <Plus
              size={22}
              strokeWidth={3}
              absoluteStrokeWidth
              className={`transition-colors duration-300 ease-in-out ${isHovered ? "text-white" : "text-black"}`}
            />
          </button>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          <ProposalModal
            isOpen={isModalOpen}
            onClose={closeModal}
            ModalType={modalType}
            interestRate={interestRate}
            interestRateInput={interestRateInput}
            onInterestRateChange={handleInterestRateChange}
            onManualInputChange={handleManualInputChange}
          />
        </div>
      </div>
    </main>
  );
};

export default BorrowersMarket;