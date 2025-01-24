import Modal from '../layout/modal';
import Dropdown from '../custom/dropdown';
import Image from 'next/image';
import { collateralOptions, durationOptions, interestRateOptions } from './_data';

type ProposalModalProps = {
  show: boolean,
  onClose: () => void,
  title?: string | string[],
};

export default function NewProposalModal({ show, onClose, title }: ProposalModalProps) {
  let size = 24;
  const options = [
    { label: <span className='flex items-center gap-2'><Image src="/icons/strk.svg" alt='Starknet' width={size} height={size} /> STARKNET</span>, value: "starknet" },
    { label: <span className='flex items-center gap-2'><Image src="/icons/solanaLogoMark.svg" alt='Solana' width={size} height={size} /> Solana</span>, value: "solana" },
    { label: <span className='flex items-center gap-2'><Image src="/icons/xionLogo.png" alt='xion' width={size} height={size} /> XION</span>, value: "xion" },
  ];

  return (
    <Modal show={show} onClose={onClose} title={title}>
      <form className='w-full flex flex-col gap-5 px-8 mb-4'>
        <span>
          <label className='text-md whitespace-nowrap'>Token</label>
          <Dropdown 
            options={options}
            onValueChange={() => { }}
            placeholder='Select a token'
            className='mt-2'
          />
        </span>

        <span>
          <label className='text-md whitespace-nowrap'>Collateral</label>
          <Dropdown 
            options={collateralOptions}
            onValueChange={() => { }}
            placeholder='Choose your collateral'
            className='mt-2'
          />
        </span>

        <span>
          <label className='text-md whitespace-nowrap'>Interest Rate</label>
          <Dropdown 
            options={interestRateOptions}
            onValueChange={() => { }}
            placeholder='Select your interest rate'
            className='mt-2'
          />
        </span>

        <span>
          <label className='text-md whitespace-nowrap'>Duration</label>
          <Dropdown 
            options={durationOptions}
            onValueChange={() => { }}
            placeholder='How long do you want to borrow for?'
            className='mt-2'
          />
        </span>
      </form>
    </Modal>
  );
}
