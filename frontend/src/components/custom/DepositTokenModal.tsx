import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
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
            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-[70px] px-6 py-4 border border-black rounded-full text-black"
            />
            <button
              type="button"
              onClick={() => setAmount(availableBalance.toString())}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#D9D9D9] rounded-[200px] px-4 py-2"
            >
              <span className="text-[#000000]">Max</span>
            </button>
          </div>
          {/* Percentage Buttons */}
          <div className='flex flex-col w-full'>
          <div className='justify-end'>
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
