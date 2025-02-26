'use client';

import { useSearchParams } from 'next/navigation';
import BorrowersMarket from './borrowersMarket';

const BorrowMarket = () => {
  const searchParams = useSearchParams();
  const selectedToken = searchParams.get('token') || 'STRK'; // Default to STRK if no token specified

  return (
    <BorrowersMarket Token={selectedToken} />
  );
};

export default BorrowMarket;
