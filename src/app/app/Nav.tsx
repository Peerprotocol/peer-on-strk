"use client";
import Image from "next/image";
import Dropdown from "./dropdown";
import { useState } from "react";
import { WalletConnectButton } from "@/components/wallets/walletConnectButton";
import Link from "next/link";

const Nav = () => {
  const [selectedOption, setSelectedOption] = useState("solana");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="flex justify-between items-center p-4 w-full gap-3">
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
      <div className="hidden md:flex self-end">
        <Image
          src="/images/notification.svg"
          height={30}
          width={30}
          alt="Notification icon"
          className="ml-4"
        />
      </div>

      {/* Dropdown and WalletConnectButton */}
      <div className="flex items-center gap-3">
        <div className="hidden">
          <Dropdown
            setSelectedOption={setSelectedOption}
            selectedOption={selectedOption}
          />
        </div>
      </div>

      {/* Mobile nav toggle */}
      <div className="md:hidden flex items-center gap-4">
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
        <div className="top-2 fixed mx-auto w-[92%] h-[fit-content] bg-white text-black  z-50 flex flex-col rounded-md p-2">
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
              <Link href="/app">
                <li className="flex gap-2">
                  <Image
                    src="/icons/market.svg"
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
                    src="/icons/dashboard.svg"
                    height={30}
                    width={30}
                    alt="Notification icon"
                    className=""
                  />
                  Dashboard
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
