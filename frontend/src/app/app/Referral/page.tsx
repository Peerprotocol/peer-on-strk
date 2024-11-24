"use client";
import Image from "next/image";
import React from "react";
import Nav from "../Nav";
import Sidebar from "../sidebar";

import RankingTable from "@/components/RankingTable";

const ReferralBoards = () => {

    return (
        <main className="bg-[#F5F5F5] min-h-screen text-black">
            <div className="flex">
                <Sidebar />

                <div className="w-full md:flex-1 flex flex-col right">
                    <Nav />

                    <div className="grid grid-cols-1 gap-4 px-10 ">
                        <div className="flex flex-col mb-10">
                            <h1 className=" text-[50px] font-semibold">Referral</h1>
                            <span className=" text-[25px] font-normal text-[#000000]">Invite friends and earn 10% of friend’s points</span>
                        </div>

                        <div className="mb-14">
                            <RankingTable />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ReferralBoards;
