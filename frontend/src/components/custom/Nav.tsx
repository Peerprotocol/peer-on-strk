"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import ConnectButton from "@/components/lib/Connect";
import AddressBar from "@/components/lib/AddressBar";
import { useAccount } from "@starknet-react/core";
import { FileText, X } from "lucide-react";
import EmailTwitterModal from "./completeProfileModal";

const Nav = () => {
  const { address } = useAccount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmailTwitterModal, setShowEmailTwitterModal] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      if (address) {
        try {
          const checkRes = await fetch(`/api/database/user?wallet=${address}`);
          if (!checkRes.ok) {
            setShowEmailTwitterModal(true);
          }
        } catch (error: any) {
          console.error('Failed to fetch user data');
        }
      }
    };
    fetchData();
  }, [address]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
          <ConnectButton 
            text="Connect Wallet"
            className="bg-black px-6 py-2 rounded-3xl text-white"
          />
        )}
      </div>

      <EmailTwitterModal 
        isOpen={showEmailTwitterModal}
        onClose={() => setShowEmailTwitterModal(false)}
        walletAddress={address}
      />

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
        <div className="top-2 fixed mx-auto w-[98%] h-[fit-content] bg-white text-black z-50 flex flex-col rounded-md p-2">
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
    </nav>
  );
};

export default Nav;