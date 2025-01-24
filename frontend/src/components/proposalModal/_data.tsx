import Image from "next/image";
const TOKEN_ADDRESSES = {
  STRK: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
};


let size = 24;
export const tokenOptions = [
  { label: <span className='flex items-center gap-2'><Image src="/icons/strk.svg" alt='Starknet' width={size} height={size} /> STRK</span>, value: TOKEN_ADDRESSES.STRK },
  { label: <span className='flex items-center gap-2'><Image src="/icons/eth.svg" alt='ETH' width={size} height={size} /> ETH</span>, value: TOKEN_ADDRESSES.ETH },
];

// Interest rate options from 1% to 10%
export const interestRateOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `${1 + i}%`,
  value: `${1 + i}`,
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
  { label: <span className='flex items-center gap-2'><Image src="/icons/strk.svg" alt='Starknet' width={size} height={size} /> STRK</span>, value: TOKEN_ADDRESSES.STRK },
  { label: <span className='flex items-center gap-2'><Image src="/icons/eth.svg" alt='ETH' width={size} height={size} /> ETH</span>, value: TOKEN_ADDRESSES.ETH },
  // Add more collateral options as needed
];
