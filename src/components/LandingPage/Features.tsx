import Image from "next/image";
import React, { useContext, useEffect } from "react";
import { DarkModeContext } from "./DarkMode";

const Features = () => {
  const { isDarkMode } = useContext(DarkModeContext);

  useEffect(() => { }, [isDarkMode]);

  return (
    <div
      className={`${isDarkMode ? "bg-[#0d101711] px-0" : "bg-[#fff]"}
    flex flex-wrap justify-center gap-8 pb-14 lg:my-40`}
    >

      {/* Card 1 */}
      <div className="w-[19rem] lg:w-[26rem] h-[100%] pb-3 bg-black z-10 relative rounded-2xl">
        <div className={`border-2 border-current z-20 w-[18.5rem] lg:w-[25rem] lg:py-16 lg:px-10 rounded-2xl lg:shadow-custom shadow-custom2 mb-3 p-8 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"
          }`}>
          <div className="flex">
            <Image
              src="/images/MarketPlace.svg"
              width={40}
              height={40}
              alt=""
              className="lg:w-[40px] w-6"
            />
            <p className="font-semibold lg:py-5 p-1">
              Transparent Marketplace
            </p>
          </div>
          <p className="lg:text-[0.8rem] tracking-wide">
            Transparent marketplace, providing borrowers with real-time deals and ensuring trustworthy transactions.
          </p>
        </div>
      </div>

      {/* Card 2 */}
      <div className="w-[19rem] lg:w-[26rem] h-[100%] pb-3 bg-black z-10 relative rounded-2xl">
        <div className={`border-2 border-current z-20 w-[18.5rem] lg:w-[25rem] lg:py-16 lg:px-10 rounded-2xl lg:shadow-custom shadow-custom2 mb-3 p-8 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"
          }`}>
          <div className="flex">
            <Image
              src="/images/UserShield.svg"
              width={40}
              height={40}
              alt=""
              className="lg:w-[40px] w-6"
            />
            <p className="font-semibold lg:py-5 p-1">
              User-Centric Interface
            </p>
          </div>
          <p className="lg:text-[0.8rem] tracking-wide">
            Seamlessly navigate our user-friendly interface. Designed with simplicity & decentralization in mind.
          </p>
        </div>
      </div>


      {/* Card 3 */}
      <div className="w-[19rem] lg:w-[26rem] h-[100%] pb-3 bg-black z-10 relative rounded-2xl">
        <div className={`border-2 border-current z-20 w-[18.5rem] lg:w-[25rem] lg:py-16 lg:px-10 rounded-2xl lg:shadow-custom shadow-custom2 mb-3 p-8 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"
          }`}>
          <div className="flex items-center">
            <Image
              src="/images/discount.png"
              width={40}
              height={40}
              alt=""
              className="lg:w-[40px] lg:h-[40px] w-6"
            />
            <p className="font-semibold lg:py-5 p-1">
              Transparent Marketplace
            </p>
          </div>
          <p className="lg:text-[0.8rem] tracking-wide">
            Transparent marketplace, providing borrowers with real-time deals and ensuring trustworthy transactions.
          </p>
        </div>
      </div>
    </div>

  );
};

export default Features;
