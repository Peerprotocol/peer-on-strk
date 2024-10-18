"use client";
import React, { useState, useContext } from "react";
import Image from "next/image";
import { DarkModeContext } from "./DarkMode";

const HeroPage = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  return (
    <>
      {/* <div className="text-current flex flex-col items-center lg:m-0 justify-center h-screen bg-background mt-[-12rem] border-2 border-green-500"> */}

      <div className="flex flex-col justify-center items-center relative w-2/3 mx-auto h-[85vh] md:h-[85vh] sm:h-[50vh]">
        <h1 className="text-center sm:text-lg md:text-lg xl:block lg:text-2xl xl:mb-[-3rem]">
          Decentralized{" "}
          <span className="xl:font-light xl:text-6xl lg:font-light lg:text-5xl font-notoserif text-xs">
            Peer-To-Peer
          </span>
        </h1>
        <h1 className="relative lg:flex flex-row lg:m-0 text-center font-bold xl:text-[13rem] lg:text-[8rem] md:text-[6rem] sm:text-[3.5rem] sm:mt-[-1rem] text-[3rem] xl:mt-[-1rem] lg:mt-[-2rem] md:mt-[-2rem]">
          LENDING
          <p className="bg-[#e7e7e7] text-black absolute border border-black lg:font-normal px-2 lg:text-xs py-1 rounded-3xl origin-top-right rotate-[25deg] text-[0.3rem] font-semibold top-[50%] left-[-5%] md:text-[0.5rem] md:left-[-3%] md:py-[0.35rem] lg:text-[1rem] lg:py-3 lg:px-4">
            Peer-to-Peer
          </p>
          <p className="bg-[#e7e7e7] text-black border border-black px-3 rounded-3xl absolute origin-top-right rotate-[-20deg] lg:font-normal font-semibold text-[0.3rem] top-[35%] left-[31%] py-1 md:text-[0.65rem] md:left-[34%] lg:text-[1rem] lg:py-2 lg:px-4">
            Autonomous
          </p>
          <p className="bg-[#e7e7e7] text-black border border-current lg:font-normal rounded-3xl absolute origin-top-right rotate-[10deg] text-[0.3rem] font-semibold px-3 py-1 right-[5%] top-[48%] md:text-[0.7rem] md:px-6 md:right-[7%] lg:text-[1rem] lg:py-[0.6rem] lg:px-10">
            Trustless
          </p>
        </h1>

        {/* Protocol */}

        <h1 className="relative xl:text-[13rem] sm:text-[3.5rem] font-bold flex items-center justify-center lg:mt-[-5rem] lg:text-[10rem] md:text-[8rem] md:mt-[-4rem] xl:mt-[-7rem] mt-[-2rem]">
          PROT
          <div className=" mt-[10px] xl:w-[150px] lg:w-[120px] md:w-[100px] h-auto w-[8rem] sm:w-10">
            <Image
              src={
                isDarkMode ? `/images/LogoWhite.svg` : `/images/LogoBlack.svg`
              }
              width={500}
              height={500}
              alt=""
              className="w-full h-full"
            />
          </div>
          COL
          <p className="bg-[#e7e7e7] text-black border border-black l px-2 rounded-3xl absolute font-normal origin-top-right rotate-[0deg] text-[0.3rem] py-1 left-[4%] bottom-[45%] md:text-[0.7rem] md:left-[4%] md:bottom-[48%] lg:text-[1rem] lg:px-5 lg:py-2">
            Decentralized
          </p>
          <p className="bg-[#e7e7e7] text-black px-2 border border-black rounded-3xl absolute origin-top-right rotate-[10deg] text-[0.3rem] py-1 right-[1%] bottom-[30%] md:text-[0.7rem] md:bottom-[35%] md:right-[3%] md:font-normal lg:text-[1rem] lg:px-5 lg:py-[0.6rem]">
            Interoperable
          </p>
        </h1>
        {/* all the position styles */}

        <p className="xl:max-w-[70%] mx-auto text-center opacity-60 md:w-[80%] md:text-sm text-[0.4rem]">
          Experience the power of decentralized finance, earn interest and
          unlock borrowing possibilities across a diverse range of assets and
          pools on our lightning-fast, cost-effective, and highly scalable
          peer-to-peer lending protocol.
        </p>
      </div>
      {/* </div> */}
      <div
        className={`${isDarkMode ? "text-[#0d101711] bg-[#0d101711]" : "bg-white"
          }`}
      >
        <p className={`${isDarkMode ? "text-white" : "text-black"} font-semibold text-black lg:text-base text-center w-full`}>
          Interoperable with
        </p>
        <div
          className={`${!isDarkMode ? "bg-[#0d101711]" : "bg-current"
            } py-30 lg:m-0 xl:m-0 bg-[#fff] text-text xl:mt-[1rem] mt-[-10rem] xl:w-full w-full px-32 md:mt-0 sm:m-0 sm:pb-10`}
        >
          <div className="flex gap-8 lg:gap-32 justify-center sm:pb-9">
            <Image
              src="/images/solanalogo.svg"
              width={200}
              height={0}
              alt=""
              className="w-16 lg:w-64 md:w-32"
            />
            <Image
              src="/images/xionlogo.svg"
              width={200}
              height={0}
              alt=""
              className="w-16 lg:w-64 md:w-32"
            />
            <Image
              src="/images/starknetlogo.svg"
              width={200}
              height={0}
              alt=""
              className="w-16 lg:w-64 md:w-32"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroPage;
