"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import ConnectButton from "@/components/lib/Connect";
import AddressBar from "@/components/lib/AddressBar";
import { useAccount } from "@starknet-react/core";
import { FileText, X } from "lucide-react";

const CHAINS = {
  SOLANA: {
    name: "SOLANA",
    redirectUrl: "https://peerprotocol.xyz/dashboard",
  },
  STARKNET: {
    name: "STARKNET",
  },
  XION: {
    name: "XION",
    redirectUrl: "https://peerprotocol.xyz/dashboard",
  },
};

const Nav = () => {
  const { address } = useAccount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (address === undefined || address === null) {
      setIsChainModalOpen(true);
    } else {
      setIsChainModalOpen(false);
    }
  }, [address]);

  const handleChainSelect = (chainName: keyof typeof CHAINS) => {
    if (chainName === "STARKNET") {
      setIsChainModalOpen(false);
    } else {
      window.location.href = CHAINS[chainName].redirectUrl;
    }
  };

  const ChainSelectionModal = () => {
    if (!isChainModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md relative bg-white text-black rounded-3xl px-8 py-4">
          <button
            onClick={() => setIsChainModalOpen(false)}
            className="absolute right-4 top-4"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="pt-3 pb-4 w-full">
            <div className="flex flex-col items-center justify-center gap-2 w-full">
              <h2 className="text-xl font-semibold text-center mb-6">
                Choose Blockchain
              </h2>
              {Object.entries(CHAINS).map(([id, chain]) => {
                if (id === "STARKNET") {
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-center gap-4 bg-white border text-black px-6 py-4 rounded-lg w-full hover:bg-black hover:text-white relative"
                    >
                      <ConnectButton
                        text={chain.name}
                        className="w-full text-center text-[14px] font-medium cursor-pointer"
                      />
                      <Image
                        src="/icons/strk.svg"
                        height={30}
                        width={30}
                        alt="Logo"
                        className="cursor-pointer h-[20px] w-[20px] absolute md:right-1/3 right-[20%]"
                      />
                    </div>
                  );
                }
                return (
                  <div
                    key={id}
                    onClick={() => handleChainSelect(id as keyof typeof CHAINS)}
                    className="flex items-center justify-center gap-4 bg-white border text-black text-[14px] px-6 py-4 rounded-lg w-full hover:bg-black hover:text-white"
                  >
                    {chain.name}
                    {id === "SOLANA" ? (
                      <Image
                        src="/icons/solanaLogoMark.svg"
                        height={80}
                        width={80}
                        alt="SolanaLogo"
                        className="cursor-pointer h-[20px] w-[20px]"
                      />
                    ) : (
                      <Image
                        src="/icons/xionLogo.png"
                        height={80}
                        width={80}
                        alt="XionLogo"
                        className="cursor-pointer h-[20px] w-[20px]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className="flex justify-end items-center p-4 w-full gap-3">
      {/* Logo for mobile */}
      <div className="md:hidden flex">
        <Image
          src="/images/LogoBlack.svg"
          height={30}
          width={30}
          alt="Logo"
          className="cursor-pointer"
        />
      </div>

      {/* Notification icon hidden on mobile */}
      <div className="hidden md:flex ">
        <Image
          src="/images/notification.svg"
          height={40}
          width={40}
          alt="Notification icon"
          className="ml-4"
        />
      </div>


      <div className="relative flex items-center gap-3">
        <Link href={'/dashboard/positions'}>
          <Image 
            src={'/images/position_icon.png'}
            alt="Position Icon"
            height={40}
            width={40}
          />
        </Link>
        {address ? (
          <div className="flex items-center gap-4">
            <AddressBar />
          </div>
        ) : (
          <button
            onClick={() => setIsChainModalOpen(true)}
            className="bg-black px-6 py-2 rounded-3xl text-white"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Mobile nav toggle */}
      <div className="lg:hidden flex items-center gap-4">
        <button onClick={toggleMobileMenu}>
          <Image
            src="/icons/menu.svg"
            height={30}
            width={30}
            alt="Mobile Menu"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="top-2 fixed mx-auto w-[98%] h-[fit-content] bg-white text-black  z-50 flex flex-col rounded-md p-2">
          <div className="w-full bg-[#efefef] flex flex-col gap-4 p-4 items-start text-left rounded-lg">
            <button onClick={toggleMobileMenu} className="self-end mb-4">
              <Image
                src="/icons/close.svg"
                height={30}
                width={30}
                alt="Close Menu"
              />
            </button>

            <ul className="flex flex-col items-start gap-6 text-lg text-left">
              <Link href="/dashboard">
                <li className="flex gap-2">
                  <Image
                    src="/images/institution.svg"
                    height={30}
                    width={30}
                    alt="Notification icon"
                    className=""
                  />
                  Market
                </li>
              </Link>
              <Link href="/profile">
                <li className="flex gap-2">
                  <Image
                    src="/images/portfolio.svg"
                    height={30}
                    width={30}
                    alt="Notification icon"
                    className=""
                  />
                  Dashboard
                </li>
              </Link>
              <Link href="/dashboard/quests">
                <li className="flex gap-2">
                  <Image
                    src="/icons/quests.svg"
                    height={30}
                    width={30}
                    alt="Notification icon"
                    className=""
                  />
                  Quests
                </li>
              </Link>
            </ul>
          </div>
        </div>
      )}

      {/* Chain Selection Modal */}
      <ChainSelectionModal />
    </nav>
  );
};

export default Nav;
