"use client";
import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";

const RankingTable = () => {
  const initialData = useMemo(
    () => [
      { id: 1, name: "Duchekelvin", score: "2,564,466 xps", rank: 1 },
      { id: 2, name: "Duchekelvin2", score: "2,564,465 xps", rank: 2 },
      { id: 3, name: "Duchekelvin3", score: "2,564,464 xps", rank: 3 },
      { id: 4, name: "Duchekelvin4", score: "2,564,463 xps", rank: 4 },
      { id: 5, name: "Duchekelvin5", score: "2,564,462 xps", rank: 5 },
      { id: 6, name: "Duchekelvin6", score: "2,564,461 xps", rank: 6 },
      { id: 7, name: "Duchekelvin7", score: "2,564,460 xps", rank: 7 },
    ],
    []
  );

  interface User {
    id: number;
    name: string;
    score: string;
    rank: number;
    numericScore?: number;
  }

  const [referralboarddata, setReferralBoarddata] = useState<User[]>([]);

  // Function to render rank as an image or text
  const renderRank = (rank: any) => {
    if (rank === 1) {
      return (
        <Image
          src="/icons/questGold.svg"
          height={25}
          width={25}
          alt="1st place"
        />
      );
    }
    if (rank === 2) {
      return (
        <Image
          src="/icons/questSilver.svg"
          height={25}
          width={25}
          alt="2nd place"
        />
      );
    }
    if (rank === 3) {
      return (
        <Image
          src="/icons/questBronze.svg"
          height={25}
          width={25}
          alt="3rd place"
        />
      );
    }
    return <span>{rank}</span>;
  };

  // Sort leaderboard data by score when the component mounts
  useEffect(() => {
    const sortedData = initialData
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
  }, [initialData]);

  return (
    <main className="w-full md:flex-1 flex flex-col">
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
              <span className=" lg:text-[25px] text-[18px] font-semibold">
                Duchekelvin
              </span>
              <span>#20,035</span>
            </div>
          </div>

          <div>
            <span>2,564,466 xps</span>
          </div>
        </div>

        <div className="tables border border-[#000000] border-opacity-10 rounded-lg">
          {referralboarddata.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border-b last:border-none"
            >
              <div className="flex items-center">
                <Image
                  src="/images/LogoBlack.svg"
                  alt="User Logo"
                  height={45}
                  width={45}
                  className="border border-[#000000] border-opacity-10 rounded-lg p-2 bg-[#F5F5F5] "
                />

                <div className="ml-4">
                  <h3 className="text-md font-medium">{user.name}</h3>
                  <span>{renderRank(user.rank)}</span>
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
