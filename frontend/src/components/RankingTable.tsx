"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
const RankingTable = () => {
    const initialData = [
        { id: 1, name: "Duchekelvin", score: "2,564,466 xps", rank: 1 },
        { id: 2, name: "Duchekelvin", score: "2,564,465 xps", rank: 2 },
        { id: 3, name: "Duchekelvin", score: "2,564,464 xps", rank: 3 },
        { id: 4, name: "Duchekelvin", score: "2,564,463 xps", rank: 4 },
        { id: 5, name: "Duchekelvin5", score: "2,564,462 xps", rank: 5 },
        { id: 6, name: "Duchekelvin6", score: "2,564,462 xps", rank: 6 },
        { id: 7, name: "Duchekelvin7", score: "2,564,461 xps", rank: 7 },
    ];

    const [referralboarddata, setReferralBoarddata] = useState(initialData);

    //function to render rank as an image
    const renderRank = (index: number): JSX.Element => {
        if (index === 0) {
            return (
                <img
                    src="/images/gold.png"
                    alt="1st place"
                />
            );
        }
        if (index === 1) {
            return (
                <img
                    src="/images/silver.png"
                    alt="2nd place"
                />
            );
        }
        if (index === 2) {
            return (
                <img
                    src="/images/bronze.png"
                    alt="3rd place"
                />
            );
        }
        return <span>{index + 1}</span>;
    };
    

    //function that sorts the leaderboard data by score when the component mounts
    useEffect(() => {
        const sortedData = [...referralboarddata]
            .map((user) => ({
                ...user,
                numericScore: parseInt(user.score.replace(/,/g, "").replace(" xps", "")),
            }))
            .sort((a, b) => b.numericScore - a.numericScore)
            .map((user, index) => ({
                ...user,
                rank: index + 1,
            }));

        setReferralBoarddata(sortedData);
    }, []);

    return (


        <main className="w-full md:flex-1 flex flex-col right">

            <div className="w-full mx-auto gap-8 flex flex-col">
                <div className="flex justify-between border border-[#000000] border-opacity-10 p-3 rounded-lg">
                    <span>Total participants</span>
                    <span>20,465,485 players</span>
                </div>

                <div className="border flex bg-white p-5 border-[#000000] border-opacity-10 justify-between items-center rounded-xl">
                    <div className="flex gap-4 justify-between">

                        <Image
                            src="/images/LogoBlack.svg"

                            alt="User Logo"
                            height={45}
                            width={45}
                            className="border border-[#000000] border-opacity-10 rounded-lg p-2 bg-[#F5F5F5]"
                        />
                        <div className="flex flex-col">
                            <span className=" text-[25px] font-semibold">Duchekelvin</span>
                            <span>#20,035</span>
                        </div>
                    </div>

                    <div>
                        <span>2,564,466 xps</span>
                    </div>
                </div>

                <div className="tables border border-[#000000] border-opacity-10 rounded-lg">
                    {referralboarddata.map((user, index) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between p-4 border-b last:border-none"
                        >
                            <div className="flex items-center">
                               
                                
                                <img
                                    src="/images/LogoBlack.svg"
                                    alt="User Logo"
                                    height={45}
                                    width={45}
                                    className="border border-[#000000] border-opacity-10 rounded-lg p-2 bg-[#F5F5F5] "
                                />

                                <div className="ml-4">
                                    <h3 className="text-md font-medium">{user.name}</h3>
                                    <span>{renderRank(index)}</span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <p className="text-md font-medium">{user.score}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </main>



    );
};

export default RankingTable;
