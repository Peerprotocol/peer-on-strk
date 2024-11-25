"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

const Nav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null); // State to store user data

  useEffect(() => {
    // Retrieve user data from localStorage on the client side
    const storedUser = localStorage.getItem('twitter_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

      {/* Display the username */}
      <div className="relative text-white bg-black rounded-full px-4 py-2">
        {user ? `Welcome, ${user}` : "@I_amprof"}
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
              <Link href="/app">
                <li className="flex gap-2">
                  <Image
                    src="/images/institution.svg"
                    height={30}
                    width={30}
                    alt="Market icon"
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
                    alt="Dashboard icon"
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
