import React, { useState } from 'react';
import Modal from '../layout/modal';
import Dropdown from '../custom/dropdown';
import { collateralOptions, durationOptions, interestRateOptions, tokenOptions } from './_data';
import { useAccount } from '@starknet-react/core';
import { useContractWrite } from '@starknet-react/core';
import { PROTOCOL_ADDRESS } from '../internal/helpers/constant';
import { TokentoHex } from '../internal/helpers';
import { toast as toastify } from 'react-toastify';

type ProposalModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  type: 'create' | 'counter';
};

interface ProposalData {
  token: string;
  collateral: string;
  quantity: string;
  duration: string;
  interestRate: string;
}

export default function NewProposalModal({
  show,
  onClose,
  title,
  type,
}: ProposalModalProps) {
  const { account } = useAccount();

  const [formData, setFormData] = useState<ProposalData>({
    token: '',
    collateral: '',
    quantity: '',
    duration: '',
    interestRate: '',
  });

  const collateralAmount = Math.floor(Number(formData.quantity || 0) * 1.3);

  const { writeAsync: createProposal, isLoading } = useContractWrite({
    calls: [
      {
        contractAddress: PROTOCOL_ADDRESS,
        entrypoint: type === 'create' ? 'create_lending_proposal' : 'create_borrow_proposal',
        calldata: [
          TokentoHex(formData.token),
          TokentoHex(formData.collateral),
          formData.quantity || '0',
          collateralAmount.toString(),
          formData.interestRate,
          formData.duration,
        ],
      },
    ],
  });

  const handleChange = (field: keyof ProposalData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!account) {
        toastify.error('Wallet not connected');
        return;
      }
      await createProposal();
      toastify.success(`${type === 'create' ? 'Lending' : 'Borrow'} proposal created successfully`);
      onClose();
    } catch (error) {
      console.error('Error creating proposal:', error);
      toastify.error('Failed to create proposal. Try again.');
    }
  };

  return (
    <Modal show={show} onClose={onClose} title={title}>
      <form className="w-full flex flex-col gap-5 px-8 mb-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-md">Token to Lend</label>
          <Dropdown
            options={tokenOptions}
            onValueChange={(option) => handleChange('token', option.value.toString())}
            placeholder="Select a token"
          />
        </div>
        <div>
          <label className="text-md">Collateral</label>
          <Dropdown
            options={collateralOptions}
            onValueChange={(option) => handleChange('collateral', option.value.toString())}
            placeholder="Choose your collateral"
          />
        </div>
        <div>
          <label>Quantity</label>
          <input
            type="text"
            className="mt-2 w-full text-base border border-black dark:border-gray-200 bg-transparent px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="0"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />
        </div>
        <div>
          <label className="text-md">Duration (days)</label>
          <Dropdown
            options={durationOptions}
            onValueChange={(option) => handleChange('duration', option.value.toString())}
            placeholder="Select duration"
          />
        </div>
        <div>
          <label className="text-md">Interest Rate (%)</label>
          <Dropdown
            options={interestRateOptions}
            onValueChange={(option) => handleChange('interestRate', option.value.toString())}
            placeholder="Select interest rate"
          />
        </div>
        <button
          type="submit"
          className={`w-max mx-auto mt-6 px-8 py-3 rounded-xl ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black text-white'
            }`}
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </Modal>
  );
}
