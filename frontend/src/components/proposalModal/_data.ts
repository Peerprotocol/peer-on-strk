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

// Placeholder for other dropdown options
export const tokenOptions = [
  { label: 'Token 1', value: 'token1' },
  { label: 'Token 2', value: 'token2' },
  // Add more token options as needed
];

export const collateralOptions = [
  { label: 'Collateral 1', value: 'collateral1' },
  { label: 'Collateral 2', value: 'collateral2' },
  // Add more collateral options as needed
];
