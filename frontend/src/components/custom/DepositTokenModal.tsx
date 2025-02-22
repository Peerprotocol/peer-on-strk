import React, { useState } from 'react';
import { XCircle, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const DepositTokenModal = ({
  isOpen,
  onClose,
  walletAddress,
  availableBalance,
  onDeposit,
}: {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  availableBalance: number;
  onDeposit: (amount: number) => Promise<void>;
}) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const depositTokens = ["STRK", "ETH"];
  const [selectedToken, setSelectedToken] = useState("STRK");
  const [isTokenOptionsOpen, setIsTokenOptionsOpen] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onDeposit(Number(amount));
      setAmount('');
      onClose();
    } catch (error) {
      console.error('Deposit Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    const calculatedAmount = (availableBalance * percentage) / 100;
    setAmount(calculatedAmount.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl py-6 px-12 w-[85%] md:w-[708px] h-fit relative flex flex-col items-center">
        <XCircle
          strokeWidth={0.5}
          className="text-black h-[40px] w-[40px] absolute right-4 cursor-pointer"
          onClick={onClose}
        />
        <h3 className="text-[25px] font-serif mt-12 mb-8 text-black">Deposit</h3>
        <form onSubmit={handleDeposit} className="w-full px-8 flex flex-col gap-3">
          <p className="text-[#00000080] text-opacity-50 text-right w-full mb-2">
            Available: ${availableBalance}
          </p>
          <div className="relative w-full">
            <div className="w-full h-[70px] border border-black rounded-full flex items-center overflow-hidden">
              <button
                type="button"
                onClick={() => setIsTokenOptionsOpen(!isTokenOptionsOpen)}
                className="rounded-full mx-4 px-4 py-2 flex items-center gap-1 border border-black"
              >
                <span className="text-[#000000]">{selectedToken}</span>
                <ChevronDown size={16} className="text-black" />
              </button>
              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 h-full px-4 py-4 text-black placeholder:text-[#0000004D] outline-none"
              />
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toString())}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#D9D9D9] rounded-[200px] px-4 py-2"
              >
                <span className="text-[#000000]">Max</span>
              </button>
            </div>
            {isTokenOptionsOpen && (
              <div className="origin-top-left absolute left-4 mt-2 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-100 z-10">
                <div className="py-1">
                  {depositTokens.map((token) => (
                    <button
                      key={token}
                      onClick={() => {
                        setSelectedToken(token);
                        setIsTokenOptionsOpen(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm ${
                        token === selectedToken ? "bg-gray-100 text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Percentage Buttons */}
          <div className="flex flex-col w-full">
            <div className="flex justify-end mt-2">
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((percentage) => (
                  <button
                    key={percentage}
                    type="button"
                    onClick={() => handlePercentageClick(percentage)}
                    className="h-[40px] bg-[#D9D9D9] rounded-full text-black text-sm hover:bg-[#C0C0C0] transition-colors px-4"
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full h-[70px] rounded-full bg-black text-white text-[25px] mt-4"
          >
            {!isSubmitting ? 'Deposit' : 'Processing'}
          </button>
        </form>
        <div className="w-full flex justify-center items-center gap-2 mt-4">
          <p className="text-xs opacity-50 text-black text-[20px]">Powered by Peer Protocol</p>
          <Image
            src="/images/LogoBlack.svg"
            height={28}
            width={28}
            alt="logo-icon"
            className="opacity-50"
          />
        </div>
      </div>
    </div>
  );
};

export default DepositTokenModal;