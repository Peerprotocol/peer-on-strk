'use client';

import { useSearchParams } from 'next/navigation';
import LendersMarket from "./lendersMarket";

const LendMarket = () => {
  const searchParams = useSearchParams();
  const selectedToken = searchParams.get('token') || 'STRK'; // Default to STRK if no token specified

  // Update your title to show the selected token
  return (
    <div className="bg-[#F5F5F5]">
      <LendersMarket Token={selectedToken} />
    </div>
  );
}

export default LendMarket;
