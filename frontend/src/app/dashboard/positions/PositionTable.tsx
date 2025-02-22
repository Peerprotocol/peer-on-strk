'use client'

// import { positionData } from "@/lib/data";
import { Raleway } from "next/font/google";
import Image from "next/image";
import { GroupedPositions } from "./page";

const raleway = Raleway({ subsets: ['latin'] })

type PositionTableProps = {
    positionData: any[]
}

export default function PositionTable({ positionData }: PositionTableProps){

    // const { address } = useAccount()

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
                    positionData.map((pos: GroupedPositions, index: number) => {
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
                                                <td className={`py-4 px-4 ${p.status.toLowerCase().includes('pending')? 'text-[#FF9900]' : p.status.toLowerCase().includes('ongoing')?'text-[#11D984]' : 'text-[#FF5348]'} tracking-wider whitespace-nowrap capitalize`}>
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