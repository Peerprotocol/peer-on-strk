"use client";
import Link from "next/link";
import { MoonIcon, SunIcon } from "@heroicons/react/solid";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import React, { useState, useContext } from "react";
import Image from "next/image";
import { DarkModeContext } from "./DarkMode";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDarkMode, toggleDark } = useContext(DarkModeContext);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="flex items-center justify-between py-6 xl:h-[15vh] md:h-[15vh] px-6 xl:px-12">
      <Image
        src={isDarkMode ? `/images/LogoWhite.svg` : `/images/LogoBlack.svg`}
        width={40}
        height={40}
        alt="Logo"
        className="w-8 xl:w-14"
      />

      {/* Desktop Menu */}
      <div className="hidden lg:flex flex-grow items-center">
        <div className="flex flex-grow items-center">
          <div className="flex-grow flex items-center justify-center space-x-4">
            <div className="flex items-center gap-4">
              <Link href="#Discord" className="flex items-center">
                <p className="cursor-pointer">Discord</p>
                <Image
                  src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
                  width={25}
                  height={25}
                  alt="Arrow"
                />
              </Link>
              <Link href="#Twitter" className="flex items-center">
                <p className="cursor-pointer">Twitter</p>
                <Image
                  src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
                  width={25}
                  height={25}
                  alt="Arrow"
                />
              </Link>
              <Link href="#Blog" className="flex items-center">
                <p className="cursor-pointer">Blog</p>
                <Image
                  src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
                  width={25}
                  height={25}
                  alt="Arrow"
                />
              </Link>
              <Link href="#Team" className="flex items-center">
                <p className="cursor-pointer">Team</p>
                <Image
                  src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
                  width={25}
                  height={25}
                  alt="Arrow"
                />
              </Link>
            </div>

            <div className="flex items-center justify-center">
              <Link href="#Documentation" className="flex items-center">
                <p className="cursor-pointer text-center">Documentation</p>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="#Careers" className="flex items-center">
                <p className="cursor-pointer">Careers</p>
                <Image
                  src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
                  width={25}
                  height={25}
                  alt="Arrow"
                />
              </Link>
              <Link href="#ReachOut" className="flex items-center">
                <p className="cursor-pointer">Reach Out</p>
                <Image
                  src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
                  width={25}
                  height={25}
                  alt="Arrow"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {/* Desktop: Show as button */}
          <Link href="/app" target="_blank">
            <button
              className={`border border-black px-6 py-2 rounded-3xl ${isDarkMode ? "hover:bg-white hover:text-black bg-black text-white" : "hover:bg-black hover:text-white bg-white text-black"}`}
              style={{ zIndex: 100, position: 'relative' }}
            >
              Launch
            </button>
          </Link>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            className={`border border-black px-1 py-1 rounded-full flex items-center space-x-2 ${isDarkMode ? "hover:bg-white hover:text-black bg-black text-white" : "hover:bg-black hover:text-white bg-white text-black"}`}
          >
            {isDarkMode ? (
              <MoonIcon className="w-8 h-8" />
            ) : (
              <SunIcon className="w-8 h-8" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center gap-2">
        {/* Dark Mode Toggle in Mobile */}
        <button
          onClick={toggleDark}
          className={`border border-black px-1 py-1 rounded-full flex items-center space-x-2 ${isDarkMode ? "hover:bg-white hover:text-black bg-black text-white" : "hover:bg-black hover:text-white bg-white text-black"}`}
        >
          {isDarkMode ? (
            <MoonIcon className="w-6 h-6" />
          ) : (
            <SunIcon className="w-6 h-6" />
          )}
        </button>

        <button onClick={toggleMenu} className="text-gray-700">
          {menuOpen ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-8 w-8" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed items-start top-0 right-0 h-full w-full shadow-lg z-50 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"} ${isDarkMode ? "bg-[#0F0F0F]" : "bg-white"}`}
      >
        <button onClick={toggleMenu} className="absolute top-4 right-4 text-gray-700">
          <XIcon className="h-6 w-6" />
        </button>

        <ul className={`px-6 py-3 my-16 text-start flex flex-col items-start leading-[4rem] text-2xl ${isDarkMode ? "text-white bg-[#0F0F0F]" : "text-black"}`}>
          <li className="flex items-center justify-center">
            <p className="cursor-pointer">Discord</p>
            <Image
              src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
              width={25}
              height={25}
              alt="Arrow"
            />
          </li>
          {/* <li className="flex items-center justify-center">
            <p className="cursor-pointer">Twitter</p>
            <Image
              src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
              width={25}
              height={25}
              alt="Arrow"
            />
          </li> */}
          <li className="flex items-center justify-center">
            <p className="cursor-pointer">Blog</p>
            <Image
              src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
              width={25}
              height={25}
              alt="Arrow"
            />
          </li>
          {/* <li className="flex items-center justify-center">
            <p className="cursor-pointer">Team</p>
            <Image
              src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
              width={25}
              height={25}
              alt="Arrow"
            />
          </li> */}
          <li className="flex items-center justify-center">
            <p className="cursor-pointer">Documentation</p>
            <Image
              src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
              width={25}
              height={25}
              alt="Arrow"
            />
          </li>

          {/* <li className="flex items-center justify-center">
            <p className="cursor-pointer">Careers</p>
            <Image
              src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
              width={25}
              height={25}
              alt="Arrow"
            />
          </li> */}
          <li className="flex items-center justify-center">
            <p className="cursor-pointer">Reach Out</p>
            <Image
              src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
              width={25}
              height={25}
              alt="Arrow"
            />
          </li>
          <li className="relative">
            {/* Mobile: Show as text */}
            <div className="lg:hidden flex items-center justify-center">
              <Link href="/app" target="_blank" className="flex items-center">
                <p className="cursor-pointer text-black">Launch</p>
                <Image
                  src={isDarkMode ? "/images/DarkModeArrow.svg" : "/images/RightArrow.svg"}
                  width={25}
                  height={25}
                  alt="Arrow"
                />
              </Link>

            </div>

            {/* Desktop */}
            <div className="hidden lg:flex items-center justify-center">
              <Link href="/app" target="_blank">
                <button
                  className={`border px-6 py-2 rounded-3xl ${isDarkMode ? "hover:bg-white hover:text-black bg-black text-white" : "hover:bg-black hover:text-white bg-white text-black"}`}
                  style={{ zIndex: 100, position: 'relative' }}
                >
                  Launch
                </button>
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;