'use client'

import { useAccount } from "@starknet-react/core";
import Nav from "../Nav";
import Sidebar from "../sidebar";
import PositionTable from "./PositionTable";

export default function AllPositions() {

    const { address } = useAccount()

    return (
        <main className="bg-[#D9D9D9] min-h-screen">
            <div className="flex">
                <Sidebar />
                <div className="w-full md:flex-1 flex flex-col">
                    <Nav />
                    {
                        address ? (
                            <div className="px-8">
                                <PositionTable />
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