"use client";
import React, {  useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";


const Navbar = () => {
  const [isClient, setisClient] = useState(false);

  useEffect(() => {
    setisClient(true);
  }, []);

  const handleWalletConnect = async () => {
    console.log("connecting to your wallet before initializing...");
    await new Promise((resolve) => setTimeout(resolve, 4000));
  };

  return (
    <nav role="navigation" className="flex justify-between mx-14 my-4">
      <Link href="/">
        {" "}
        <div className="flex gap-3 items-center">
          <div>
            <Image
              src=".\images\logo.svg"
              alt="Description of the image"
              width={55}
              height={55}
            />
          </div>
          <p className="text-2xl">Peer Protocol</p>
        </div>
      </Link>
      <div className="flex" suppressHydrationWarning={true}>
        <div className="flex gap-16">
          <div className="flex items-center gap-8">
            <Link href="/peerapp">
              <p>Portfolio</p>
            </Link>
            <Link href="/deposit">
              <p>Deposit/Withdraw</p>
            </Link>
            <Link href="/borrow">
              <p>Borrow/Lend</p>
            </Link>
            {/* {!initialized ? (
              // <button onClick={initializeUser}>Initialize</button>
              
            ) : (
              <></>
            )} */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
