'use client'

import { positionData } from "@/lib/data";
import { Raleway } from "next/font/google";
import Image from "next/image";
import ABI from '../../../../public/abi/protocol.json'
import { PROTOCOL_ADDRESS } from "@/components/internal/helpers/constant";
import { normalizeAddress, toHex } from "@/components/internal/helpers";
import { useContractRead } from "@starknet-react/core";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { felt252ToHex } from "@/components/internal/helpers";

const raleway = Raleway({ subsets: ['latin'] })

const TOKEN_ADDRESSES = {
    STRK: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
}

0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7

function normalizeStarknetAddress(address: string): { isValid: boolean, normalizedStarknetAddress: string} {
    // Basic validation
    if (!address.startsWith('0x')) {
        return { isValid: false, normalizedStarknetAddress: address };
    }

    // Remove 0x prefix for processing
    const cleanAddress = address.slice(2);
    
    // Check valid characters
    if (!/^[0-9a-fA-F]+$/.test(cleanAddress)) {
        return { isValid: false, normalizedStarknetAddress: address };
    }

    // Check length requirements
    if (cleanAddress.length === 63) {
        // Pad with leading zero if length is 63 characters (without 0x)
        const normalized = `0x0${cleanAddress}`;
        return { isValid: true, normalizedStarknetAddress: normalized };
    }

    if (cleanAddress.length !== 64) {
        return { isValid: false, normalizedStarknetAddress: address };
    }

    // Check if starts with 0 after 0x (optional requirement)
    const startsWithZero = cleanAddress.startsWith('0');
    
    return {
        isValid: true,
        normalizedStarknetAddress: startsWithZero ? address : `0x0${cleanAddress.slice(1)}`
    };
}  

export function felt252ToString(feltValue: any) {
    // Convert the Felt252 value to a hexadecimal string
    let hex = feltValue?.toString(16);
  
    // Add leading zeroes if the hex string length is not a multiple of 2
    if (hex?.length % 2 !== 0) hex = "0" + hex;
  
    // Convert the hex string to a readable ASCII string
    let result = "";
    for (let i = 0; i < hex?.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      result += String.fromCharCode(charCode);
    }
  
    return result;
}


export default function PositionTable(){

    const { address } = useAccount()
    
    const getTokenName = (tokenAddress: string): string => {
        const normalizedAddress = tokenAddress.toLowerCase();
        const { normalizedStarknetAddress} = normalizeStarknetAddress(normalizedAddress)
        for (const [name, address] of Object.entries(TOKEN_ADDRESSES)) {
          if (address.toLowerCase() === normalizedStarknetAddress) {
            return name; // Return token name if matched
          }
        }

        return "Unknown";
    };

    const starknetTimeStampToDate = (timestamp: number): string => {
        const date = new Date(timestamp * 1000)
        return date.toLocaleString()
    }

    const { address: user } = useAccount()
    // const [proposals, setProposals] = useState<undefined | any[]>(undefined)

    const {
        data: borrowProposals,
        isLoading: isLoadingBorrowProposals,
        refetch: refetchBorrowProposals,
        isFetching: isFetchingBorrowProposals,
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

    // console.log(borrowProposals)

    const {
        data: lendingProposals,
        isLoading: isLoadingLendingProposals,
        refetch: refetchLendingProposals,
        isFetching: isFetchingLendingProposals,
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

    const proposals = [...safeBorrowProposals, ...safeLendProposals]

    const singlePosition = proposals?.[0]
    console.log(singlePosition)

    const refinedSinglePosition = {
        id: singlePosition?.id?.toString(),
        // asset: getTokenName(toHex(singlePosition?.token?.toString())),
        positionType: singlePosition?.proposal_type?.variant?.LENDING === undefined ? 'Borrow':'Lend',
        price: '0.99',
        // amount: Number(singlePosition?.token_amount / BigInt(10 ** 18)).toFixed(2),
        merchant: user,
        status: singlePosition?.is_cancelled === false && singlePosition?.is_accepted !== true ? 'Pending'
                : singlePosition?.is_accepted === true && singlePosition?.is_repaid !== true ? 'Ongoing'
                : singlePosition?.is_accepted === true && singlePosition?.is_repaid === true ? 'Completed' : '',
        created_at: starknetTimeStampToDate(singlePosition?.created_at?.toString())
    }

    console.log(refinedSinglePosition)

    // console.log(singlePositionData)

    // console.log(borrowProposals)
    // console.log(lendingProposals)

    

    const shortenAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className={`${raleway.className} text-black my-8 overflow-x-auto`}>
            <h1 className="font-semibold">{positionData[0].month}</h1>
            <table className="w-full md:basis-[100%] text-[10px] md:text-base bg-white-100 text-left min-w-[500px] divide-y divide-gray-700 my-4">
                <thead className="bg-white-100 text-gray-450 py-4 font-light rounded-t-lg">
                    <tr className="bg-[#bebbbb] px-2">
                        <th className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize">Asset</th>
                        <th className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize">Position Type</th>
                        <th className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize">Price</th>
                        <th className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize">Amount</th>
                        <th className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize">Merchant</th>
                        <th className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize">Status</th>
                        <th className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize">Created At</th>
                    </tr>
                </thead>

                {
                    positionData.map((pos, index) => {
                        return (
                            <tbody key={index} className="py-10">
                                <p className={`font-semibold ${index !== 0 && 'mt-7'}`}>
                                    {index !== 0 && pos.month}
                                </p>
                                {
                                    pos.data.map((p, i) => {
                                        return (
                                            <tr key={i} className={`border-b ${i === pos.data.length && 'mb-7'}`}>
                                                <td className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize font-semibold">
                                                    <div className="flex gap-1 font-bold">
                                                        <Image 
                                                            src={'/images/usdc_icon.png'}
                                                            alt="USDC Icon"
                                                            width={20}
                                                            height={5}
                                                        />
                                                        {p.asset}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize font-semibold">
                                                    {p.position_type}
                                                </td>
                                                <td className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize font-semibold">
                                                    ${p.price}
                                                </td>
                                                <td className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize font-semibold">
                                                    {p.amount}
                                                </td>
                                                <td className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize font-semibold">
                                                    {shortenAddress(p.merchant)}
                                                </td>
                                                <td className={`py-4 px-4 ${p.status.toLowerCase().includes('pending')? 'text-[#FF5348]' : p.status.toLowerCase().includes('ongoing')?'text-[#11D984]' : ''} tracking-wider whitespace-nowrap capitalize`}>
                                                    {p.status}
                                                </td>
                                                <td className="py-4 px-4 text-gray-350 tracking-wider whitespace-nowrap capitalize font-semibold">
                                                    {p.created_at}
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        )
                    })
                }
            </table>
        </div>
    )
}