import React from "react";
import { useState } from "react";
import { allowedCoins } from "../constants/coins";

const CreateproposalComponent = ({
  show,
  onClose,
}: {
  show: any;
  onClose: any;
}) => {
  const [amount, setAmount] = useState("");
  const [percentage, setPercentage] = useState("");
  const [duration, setDuration] = useState("");
  const [coin, setCoin] = useState(allowedCoins[0]);

  const createLoanProposal = async (e: any) => {
    e.preventDefault();
  };

  if (!show) {
    return null;
  }
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="flex flex-col gap-4 bg-black modal w-[50%] h-[fit-content] p-4 mx-auto">
        <span className="flex flex-row justify-between px-8 py-4">
          <p>Create a proposal</p>
          <button onClick={onClose}>close</button>
        </span>
        <div className="flex flex-col gap-4 px-8 py-4">
          <p>Asset</p>
          <form method="post" className="flex flex-col gap-4">
            <div className="w-full mt-4 flex gap-4 px-4 py-1.5 items-center bg-[#ffffff2c] rounded-2xl">
              <div className="border rounded-xl px-2 bg-[#ffffff15]">
                <select
                  className="text-white relative p-2 px-4 py-3 bg-[#ffffff00]"
                  onChange={(e) => setCoin(allowedCoins[e.target.selectedIndex])}
                >
                  {allowedCoins.map((coin_, i) => (
                    <option key={i}>{coin_.ticker}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={0}
                placeholder="Enter Amount"
                className="h-14 flex w-full rounded-2xl text-2xl bg-transparent border-none outline-none"
              />
            </div>
            <p>Interest Rate (%)</p>
            <input
              type="text"
              inputMode="numeric"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              min={0}
              placeholder="Interest Rate %"
              className="h-[10vh] flex w-[50%] rounded-2xl px-4 text-[1.2rem] bg-[#ffffff2c] border-none outline-none"
            />

            <p>Duration in Days</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={0}
              placeholder="Enter Duration in days"
              className="h-[10vh] flex w-[50%] rounded-2xl px-4 text-[1.2rem] bg-[#ffffff2c] border-none outline-none"
            />
            <button
              type="submit"
              className="mt-4 rounded-full px-4 py-4 text-[1.2rem] bg-green-600 w-[50%] self-center"
              onClick={(e) => createLoanProposal(e)}
            >
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateproposalComponent;
