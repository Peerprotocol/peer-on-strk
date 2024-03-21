"use client";
import React from "react";
import { usePathname } from "next/navigation";

const SelectSwitch = () => {
  const pathname = usePathname();
  return (
    <div>
      <div className="flex justify-between items-center">
        <span>You're paying</span>
        <span className="text-[#ffffff2c] text-sm cursor-pointer">0 USDC</span>
      </div>

      <form method="post">
        <div className="w-full mt-4 flex gap-4 px-4 py-1.5 items-center bg-[#ffffff2c] rounded-2xl">
          <div className="border rounded-xl px-2 bg-[#ffffff15]">
            <select className="text-white relative p-2 px-4 py-3 bg-[#ffffff00]">
              <option value="" aria-disabled></option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            onKeyDown={(event) => {
              const key = event.key;
              if (key !== "Backspace" && !/^\d$/.test(key)) {
                event.preventDefault();
              }
            }}
            min={0}
            placeholder="Enter Amount"
            className="h-14 flex w-full rounded-2xl text-2xl bg-transparent border-none outline-none"
          />

          <button className="text-[#ffffff4b] pr-8">MAX</button>
        </div>
      </form>

      <button className="px-8 py-4 rounded-2xl bg-green-700 text-white w-full  mt-9 h-fit">
        {pathname === "/deposit" ? "Deposit" : "Withdraw"}
      </button>
    </div>
  );
};

export default SelectSwitch;
