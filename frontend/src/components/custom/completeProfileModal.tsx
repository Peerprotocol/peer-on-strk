"use client";
import { XCircle } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const EmailTwitterModal = ({
  isOpen,
  onClose,
  walletAddress,
}: {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}) => {
  const [email, setEmail] = useState("");
  const [twitter, setTwitter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create user if doesn't exist
      await fetch("/api/database/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          user_email: email,
          user_twitter: twitter,
        }),
      });
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl md:rounded-[38px] py-2 md:py-6 px-4 md:px-12 w-[85%] md:w-[708px] h-fit md:h-[504px] relative flex flex-col items-center">
        <XCircle
          strokeWidth={0.5}
          className="text-black font-thin h-[40px] md:h-[50px] w-[40px] md:w-[50px] absolute right-4 cursor-pointer"
          onClick={onClose}
        />
        <h3 className="text-[18px] md:text-[25px] font-serif mt-16 md:mt-12 mb-4 md:mb-8 text-black">
          {" "}
          Complete Your Profile
        </h3>
        <form
          onSubmit={handleSubmit}
          className="w-full h-full px-2 md:px-8 flex flex-col gap-2 md:gap-3"
        >
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[60px] md:h-[70px] px-6 py-4 border border-black rounded-full md:mb-3 text-black"
          />
          <input
            type="text"
            placeholder="Enter your X (Twitter) Username"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="w-full h-[60px] md:h-[70px] px-6 py-4 border border-black rounded-full md:mb-3 text-black"
          />
          <button
            type="submit"
            className="w-full h-[60px] md:h-[70px] rounded-full bg-black text-white font-thin text-[18px] md:text-[25px] mt-4"
          >
            {!isSubmitting ? "Submit" : "Processing"}
          </button>
        </form>
        <div className="w-full flex justify-center items-center gap-2 mt-4 mb-3 md:mb-0">
          <p className="text-xs opacity-50 text-black text-[12px] md:text-[20px]">
            Powered by Peer Protocol
          </p>
          <Image
            src="/images/LogoBlack.svg"
            height={500}
            width={500}
            alt="logo-icon"
            className="w-[18px] md:w-[28px] h-[18px] md:h-[28px] opacity-50"
          />
        </div>
      </div>
    </div>
  );
};

export default EmailTwitterModal;
