'use client'

import { useAccount } from "@starknet-react/core";
import Nav from "../../../components/custom/Nav";
import Sidebar from "../../../components/custom/sidebar";
import PositionTable from "./PositionTable";
import { useContractRead } from "@starknet-react/core";
import ABI from '../../../../public/abi/protocol.json'
import { PROTOCOL_ADDRESS } from "@/components/internal/helpers/constant";
import { normalizeAddress, toHex } from "@/components/internal/helpers";

export type FormattedPosition = {
    asset: string;
    position_type: string;
    merchant: string;
    created_at: string;
    status: string;
    timestamp: string;
    amount: string;
    price: string;
    month: string
};

export type GroupedPositions = {
    month: string;
    data: FormattedPosition[];
};
  


export default function AllPositions() {
    
    const TOKEN_ADDRESSES = {
        STRK: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
        ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    }

    const getTokenName = (tokenAddress: string): string => {
        const strippedAddress = tokenAddress.slice(-63)
        for (const [name, address] of Object.entries(TOKEN_ADDRESSES)) {
          if (address.toLowerCase().slice(-63) === strippedAddress) {
            return name; // Return token name if matched
          }
        }
        return "Unknown";
    };

    const timeStampToDate = (timestamp: number): string => {
        const date = new Date(timestamp * 1000)
        const dateString = date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        })
        return dateString
    }

    const timeStampToMonth = (timestamp: number): string => {
        const date = new Date(timestamp * 1000)
        const dateString = date.toLocaleString('en-US', {
            month: 'short', day: 'numeric'
        })
        return dateString
    } 

    const { address } = useAccount()

    const {
        data: borrowProposals,
        isLoading: isLoadingBorrowProposals,
    } = useContractRead(
        address
        ? {
            functionName: 'get_borrow_proposal_details',
            args: [],
            abi: ABI,
            address: PROTOCOL_ADDRESS,
            watch: true
        }: ({} as any)
    )

    const {
        data: lendingProposals,
        isLoading: isLoadingLendingProposals,
    } = useContractRead(
        address
        ? {
            functionName: 'get_lending_proposal_details',
            args: [],
            abi: ABI,
            address: PROTOCOL_ADDRESS,
            watch: true
        }: ({} as any)
    )

    const safeBorrowProposals = Array.isArray(borrowProposals) ? borrowProposals : [];
    const safeLendProposals = Array.isArray(lendingProposals) ? lendingProposals : [];
    const userPositions = [
        ...safeBorrowProposals, ...safeLendProposals
    ].filter((proposal) => {
        const lender = toHex(proposal?.lender?.toString());
        const borrower = toHex(proposal?.borrower?.toString());

        return normalizeAddress(address) === normalizeAddress(lender) || normalizeAddress(address) === normalizeAddress(borrower)
    })

    const formattedUserPositions: FormattedPosition[] = userPositions.map((position, index) => {
        const asset = getTokenName(toHex((position?.token?.toString() as string)));
        const position_type = position?.proposal_type?.variant?.LENDING === undefined ? 'Borrow':'Lend';
        const created_at = timeStampToDate((position?.created_at?.toString()));
        const status = position?.is_cancelled === false && position?.is_accepted !== true ? 'Pending'
        : position?.is_accepted === true && position?.is_repaid !== true ? 'Ongoing'
        : position?.is_accepted === true && position?.is_repaid === true ? 'Completed'
        : position?.is_cancelled === true ? 'Cancelled' : '';
        const timestamp = position?.created_at?.toString()
        const amount = Number(position?.token_amount / BigInt(10 ** 18)).toFixed(2)
        const price = position?.amount?.toString();
        const month = timeStampToMonth((position?.created_at?.toString()))
        const lender = toHex(position?.lender?.toString());
        
        return {
            asset, 
            position_type,
            merchant: lender,
            created_at,
            status,
            timestamp,
            amount,
            price,
            month
        }
    })

    const groupPositionsByMonth = (positions: FormattedPosition[]) => {
        // Group positions by month
        const grouped = positions.reduce((acc, position) => {
          const date = new Date(position.created_at);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const monthKey = `${month} ${year}`;
      
          if (!acc[monthKey]) {
            acc[monthKey] = {
              month: monthKey,
              data: []
            };
          }
          
          acc[monthKey].data.push(position);
          return acc;
        }, {} as Record<string, { month: string; data: FormattedPosition[] }>);
      
        // Convert to array and sort descending
        return Object.values(grouped).sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          
          const aDate = new Date(`${aMonth} 1, ${aYear}`);
          const bDate = new Date(`${bMonth} 1, ${bYear}`);
          
          return bDate.getTime() - aDate.getTime();
        });
    };

    const groupedPositions = groupPositionsByMonth(formattedUserPositions)

    return (
        <main className="bg-[#efefef] min-h-screen">
            <div className="flex">
                <Sidebar />
                <div className="w-full md:flex-1 flex flex-col">
                    <Nav />
                    {
                        address ? (
                            <div className="px-8">
                                <PositionTable positionData={groupedPositions} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-black">Please connect your wallet to continue</h1>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </main>
    )
}