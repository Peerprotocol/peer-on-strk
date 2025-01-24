import Image from "next/image";


let size = 24;
export const tokenOptions = [
  { label: <span className='flex items-center gap-2'><Image src="/icons/strk.svg" alt='Starknet' width={size} height={size} /> STARKNET</span>, value: "starknet" },
  { label: <span className='flex items-center gap-2'><Image src="/icons/solanaLogoMark.svg" alt='Solana' width={size} height={size} /> Solana</span>, value: "solana" },
  { label: <span className='flex items-center gap-2'><Image src="/icons/xionLogo.png" alt='xion' width={size} height={size} /> XION</span>, value: "xion" },
];

// Interest rate options from 15% to 70%
export const interestRateOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${15 + i * 5}%`,
  value: `${15 + i * 5}`,
}));

// Duration options starting from 7 days, with 6 objects
export const durationOptions = [
  { label: '7 days', value: '7' },
  { label: '14 days', value: '14' },
  { label: '21 days', value: '21' },
  { label: '28 days', value: '28' },
  { label: '35 days', value: '35' },
  { label: '42 days', value: '42' },
];



export const collateralOptions = [
  { label: 'Collateral 1', value: 'collateral1' },
  { label: 'Collateral 2', value: 'collateral2' },
  // Add more collateral options as needed
];
