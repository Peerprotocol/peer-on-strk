
import { InfoIcon } from "lucide-react";
import { memo, useState } from "react";
import { useAccount, useContractRead } from "@starknet-react/core";
import { PEER_PROTOCOL_DEPLOYED_CONTRACT_ADDRESS } from "@/components/internal/helpers/constant";
import { TotalAssetsOverviewDisplay, UserAsset, UserAssetOverview } from "@/types";
import { formatUSD } from "@/components/internal/helpers";


const GET_USER_ASSETS_ABI = [{
  "type": "function",
  "name": "get_user_assets",
  "inputs": [
    {
      "name": "user",
      "type": "core::starknet::contract_address::ContractAddress"
    }
  ],
  "outputs": [
    {
      "type": "core::array::Array::<peer_protocol::peer_protocol::PeerProtocol::UserAssets>"
    }
  ],
  "state_mutability": "view"
}] as const;


// interface UserAsset {
//   token_address: string,
//   total_lent: number,
//   total_borrowed: number,
//   interest_earned: number,
//   available_balance: number
// };


const AllAssetsOverview: TotalAssetsOverviewDisplay[] = [
  { id: 'available_balance', label: 'Available Balance', value: '$0.0', info: 'Information about Available Balance' },
  { id: 'total_lent', label: 'Total Lend', value: '$0.0', info: 'Information about Total Lend' },
  { id: 'total_borrowed', label: 'Total Borrow', value: '$0.0', info: 'Information about Total Borrow' },
  { id: 'interest_earned', label: 'Interest Earned', value: '$0.0', info: 'Information about Interest Earned' },
];


const Dashboard = () => {

  const { address } = useAccount();

  const [totalAssetsOverview, setTotalAssetsOverview] = useState<UserAssetOverview>({
    available_balance: BigInt(0),
    interest_earned: BigInt(0),
    total_borrowed: BigInt(0),
    total_lent: BigInt(0),
  });


  const { data, error } = useContractRead({
    abi: GET_USER_ASSETS_ABI,
    functionName: "get_user_deposits",
    address: PEER_PROTOCOL_DEPLOYED_CONTRACT_ADDRESS,
    args: [address!],
    watch: true
  });

  console.log("[GET_USER_ASSETS]: ", data, error);


  if (data) {
    console.log("[Total Assets]: ", data);
    const total = (data as UserAsset[]).reduce((pValue, currentValue) => {
      pValue.available_balance += currentValue.available_balance
      pValue.interest_earned += currentValue.interest_earned
      pValue.total_borrowed += currentValue.total_borrowed
      pValue.total_lent += currentValue.total_lent
      return pValue;
    },
      totalAssetsOverview);
    setTotalAssetsOverview(total);
  }

  return (
    <div className="border border-gray-200 rounded-[1rem] flex flex-col gap-6 md:p-6 p-2 bg-white w-full">
      {/* Dashboard Items Container */}
      <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4 3xl:gap-[2rem] w-full">
        {AllAssetsOverview.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 p-6 rounded-xl mt-4 bg-smoke-white relative flex flex-col justify-center w-full lg:w-[calc(51%-1rem)] 3xl:w-[48%]" // Set 33% width for lg screens
          >
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className="text-[2.2rem] font-semibold text-black pb-8">
              {formatUSD(totalAssetsOverview[item.id as keyof UserAssetOverview])}
            </p>

            {/* Info Icon */}
            {item.info && (
              <InfoIcon
                className="cursor-pointer absolute top-2 right-3 w-5 h-5 text-gray-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

};

export default memo(Dashboard);
