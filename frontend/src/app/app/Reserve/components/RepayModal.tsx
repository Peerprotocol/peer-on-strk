import type React from "react";
import { useState } from "react";
import { X, DollarSign } from "lucide-react";

interface RepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountBorrowed?: number;
  onRepay: (amount: number) => void;
}

const RepayModal: React.FC<RepayModalProps> = ({
  isOpen,
  onClose,
  amountBorrowed = 500,
  onRepay,
}) => {
  const [amount, setAmount] = useState("");

  const handlePercentageClick = (percentage: number) => {
    const calculatedAmount = (amountBorrowed * percentage) / 100;
    setAmount(calculatedAmount.toFixed(2));
  };

  const handleMaxClick = () => {
    setAmount(amountBorrowed.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onRepay(Number.parseFloat(amount));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold text-center mb-6">Repay Loan</h2>
        <div className="text-gray-600 text-center mb-8">
          <span className="text-sm uppercase tracking-wide">
            Amount Borrowed
          </span>
          <div className="text-4xl font-semibold text-gray-800">
            ${amountBorrowed.toFixed(2)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount"
              className="w-full pl-10 pr-20 py-4 border-2 text-black border-gray-200 rounded-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              max={amountBorrowed}
              min={0}
              step="0.01"
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
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
                className="w-20 bg-gray-100 py-3 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {percentage}%
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={
              !amount ||
              Number.parseFloat(amount) <= 0 ||
              Number.parseFloat(amount) > amountBorrowed
            }
            className="w-full bg-slate-950 text-white py-4 rounded-full text-lg font-semibold  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Repay ${amount || "0.00"}
          </button>
        </form>
        <div className="flex items-center justify-center gap-2 mt-8 text-gray-500 text-lg">
          Powered by peerprotocol
          <img src="./badge.svg" alt="peerprotocol logo" className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
};

export default RepayModal;
