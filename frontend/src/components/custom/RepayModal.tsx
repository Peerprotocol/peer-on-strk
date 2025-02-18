import type React from "react";
import { useState } from "react";
import { X, DollarSign, Loader2 } from "lucide-react";
import Image from "next/image";
import { useContractWrite } from "@starknet-react/core";
import { PROTOCOL_ADDRESS } from "../internal/helpers/constant";
import protocolAbi from "../../../public/abi/protocol.json";
import { toast as toastify } from "react-toastify";
import { CallData } from "starknet";

interface RepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountBorrowed?: number | 0;
  proposalId: any;
}

const RepayModal: React.FC<RepayModalProps> = ({
  isOpen,
  onClose,
  amountBorrowed,
  proposalId,
}) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { write: cancel } = useContractWrite({
    calls: [
      {
        abi: protocolAbi,
        contractAddress: PROTOCOL_ADDRESS,
        entrypoint: "repay_proposal",
        calldata: [], // This will be filled when calling
      },
    ],
  });

  const handlePercentageClick = (percentage: number) => {
    const calculatedAmount = ((amountBorrowed ?? 0) * percentage) / 100;
    setAmount(calculatedAmount.toFixed(2));
  };

  const handleMaxClick = () => {
    if (amountBorrowed !== undefined) {
      setAmount(amountBorrowed.toFixed(2));
    }
  };

  if (!isOpen) return null;

  const repayProposal = async (proposalId: any, amount: any) => {
    try {
      setIsLoading(true);
      const transaction = await cancel({
        calls: [
          {
            abi: protocolAbi,
            contractAddress: PROTOCOL_ADDRESS,
            entrypoint: "repay_proposal",
            calldata: CallData.compile([proposalId, '0', BigInt(amount), '0']),
          },
        ],
      });

      if (transaction?.transaction_hash) {
        toastify.success("Transaction submitted");

        // Wait for transaction
        await transaction.wait();
        console.log("Transaction completed!");
        toastify.success("Proposal repaid successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error repaying:", error);
      toastify.error("Failed. Try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl relative shadow-2xl">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold text-center mb-6">Repay Loan</h2>
        <div className="text-gray-600 text-center mb-8">
          <span className="text-sm uppercase tracking-wide">
            Amount Borrowed / Remaining
          </span>
          <div className="text-4xl font-semibold text-gray-800">
            ${(amountBorrowed ?? 0)}
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount"
              disabled={isLoading}
              className="w-full pl-10 pr-20 py-4 border-2 text-black border-gray-200 rounded-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              max={amountBorrowed}
              min={0}
              step="0.01"
            />
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Max
            </button>
          </div>
          <div className="flex justify-center gap-4 mb-2">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => handlePercentageClick(percentage)}
                disabled={isLoading}
                className="w-20 bg-gray-100 py-3 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {percentage}%
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={
              isLoading ||
              !amount ||
              Number.parseFloat(amount) <= 0 ||
              Number.parseFloat(amount) > (amountBorrowed ?? 0)
            }
            onClick={() => repayProposal(proposalId, Number(amount))}
            className="w-full bg-slate-950 text-white py-4 rounded-full text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Repay $${amount || "0.00"}`
            )}
          </button>
        </form>
        <div className="flex items-center justify-center gap-2 mt-8 text-gray-500 text-lg">
          Powered by peerprotocol
          <Image src="/images/badge.svg" alt="peerprotocol logo" className="h-9 w-9" width={500} height={50}/>
        </div>
      </div>
    </div>
  );
};

export default RepayModal;