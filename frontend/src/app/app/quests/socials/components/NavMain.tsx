"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import AddressBar from "@/components/lib/AddressBar";
import ConnectButton from "@/components/lib/Connect";
import { useAccount } from "@starknet-react/core";


const Nav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { address } = useAccount();
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="flex justify-between items-center p-4 z-10 w-full gap-3">
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
          src="/images/LogoBlack.svg"
          height={30}
          width={30}
          alt="Notification icon"
          className="ml-4"
        />
      </div>


      <div className="relative hidden md:block">
            {address ? (
              <div className="flex items-center gap-4">
                <AddressBar />
                {/* <MenuButton /> */}
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>

      {/* Mobile nav toggle */}
      <div className="lg:hidden flex items-center gap-4">
        <button onClick={toggleMobileMenu}>
          <Image
            src="/icons/hamburger.svg"
            height={30}
            width={30}
            alt="Mobile Menu"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (

        //fixed the navbar for my social section so it has margin at both left and right,
        <div className="top-2 fixed mx-auto w-[93%] h-[fit-content] bg-white text-black  z-50 flex flex-col rounded-md p-2">
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
                    src="/images/institution.svg"
                    height={30}
                    width={30}
                    alt="quest icon"
                    className=""
                  />
                  Market
                </li>
              </Link>
              
              <Link href="/profile">
                <li className="flex gap-2">
                  <Image
                    src="/images/drop-of-liquid.svg"
                    height={30}
                    width={30}
                    alt="quest icon"
                    className=""
                  />
                  Liquidity
                </li>
              </Link>

              <Link href="/profile">
                <li className="flex gap-2">
                  <Image
                    src="/images/reverse-arrow.svg"
                    height={30}
                    width={30}
                    alt="quest icon"
                    className=""
                  />
                  Swap
                </li>
              </Link>
              <Link href="/profile">
                <li className="flex gap-2">
                  <Image
                    src="/images/dashboard.svg"
                    height={30}
                    width={30}
                    alt="quest icon"
                    className=""
                  />
                  Porfolio
                </li>
              </Link>

              <Link href="/profile">
                <li className="flex gap-2">
                  <Image
                    src="/images/asset-allocation.svg"
                    height={30}
                    width={30}
                    alt="quest icon"
                    className=""
                  />
                  Asset manager
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
