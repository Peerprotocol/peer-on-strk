import React, { useState } from "react";
import Modal from "../layout/modal";
import Dropdown from "../custom/dropdown";
import {
  collateralOptions,
  durationOptions,
  interestRateOptions,
  tokenOptions,
} from "./_data";
import { useAccount } from "@starknet-react/core";
import { useContractWrite } from "@starknet-react/core";
import { PROTOCOL_ADDRESS } from "../internal/helpers/constant";
import { TokentoHex } from "../internal/helpers";
import { toast as toastify } from "react-toastify";
import { CallData } from "starknet";
import AssetsLoader from "@/app/dashboard/loaders/assetsloader";

type ProposalModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  type: "lend" | "counter" | "borrow";
  proposalId?: string;
};

interface ProposalData {
  proposalId: string;
  token: string;
  collateral: string;
  quantity: string;
  duration: string;
  interestRate: string;
}

export default function NewProposalModal({
  show,
  onClose,
  title,
  type,
  proposalId,
}: ProposalModalProps) {
  const { account } = useAccount();
  const [Loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProposalData>({
    proposalId: "",
    token: "",
    collateral: "",
    quantity: "",
    duration: "",
    interestRate: "",
  });

  const entrypoint =
    type === "lend"
      ? "create_lending_proposal"
      : type === "borrow"
      ? "create_borrow_proposal"
      : type === "counter"
      ? "create_counter_proposal"
      : null;

  const { writeAsync: createProposal, isLoading } = useContractWrite({
    calls: [
      {
        contractAddress: PROTOCOL_ADDRESS,
        entrypoint: entrypoint,
        calldata: CallData.compile(
          type === "counter"
            ? [
                proposalId || "0",
                "0",
                formData.quantity || "0",
                "0",
                TokentoHex(formData.collateral || "0x0"),
                formData.interestRate || "0",
                formData.duration || "0",
              ]
            : [
                TokentoHex(formData.token || "0x0"),
                TokentoHex(formData.collateral || "0x0"),
                formData.quantity || "0",
                "0",
                formData.interestRate || "0",
                formData.duration || "0",
              ]
        ),
      },
    ],
  });

  const handleChange = (field: keyof ProposalData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!account) {
        toastify.error("Wallet not connected");
        return;
      }

      // Execute contract write
        await createProposal();

      // Construct transaction payload
      const transactionData = {
        user_address: account.address,
        token: formData.token,
        amount: formData.quantity,
        transaction_type: type, // lend, borrow, counter
        timestamp: new Date().toISOString(),
      };

      // Send transaction data to backend
      await fetch("/api/database/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      // Success message
      toastify.success(
        `${
          type === "lend" ? "Lending" : type === "borrow" ? "Borrow" : "Counter"
        } proposal created successfully`
      );
      setFormData({
        proposalId: "",
        token: "",
        collateral: "",
        quantity: "",
        duration: "",
        interestRate: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating proposal:", error);
      toastify.error("Failed to create proposal. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title={title}>
      {Loading ? (
        <AssetsLoader />
      ) : (
        <form
          className="w-full flex flex-col gap-5 px-8 mb-4"
          onSubmit={handleSubmit}
        >
          {type != "counter" && (
            <div>
              <label className="text-md text-black">
                Token to {type === "lend" ? "Lend" : "Borrow"}
              </label>
              <Dropdown
                options={tokenOptions}
                onValueChange={(option) =>
                  handleChange("token", option.value.toString())
                }
                placeholder="Select a token"
              />
            </div>
          )}
          <div>
            <label className="text-md text-black">Collateral</label>
            <Dropdown
              options={collateralOptions}
              onValueChange={(option) =>
                handleChange("collateral", option.value.toString())
              }
              placeholder="Choose your collateral"
            />
          </div>
          <div>
            <label className="text-md text-black">Amount in $</label>
            <input
              type="text"
              className="mt-2 w-full text-base text-black border border-black bg-transparent px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="$10"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
            />
          </div>
          <div>
            <label className="text-md text-black">Duration (days)</label>
            <Dropdown
              options={durationOptions}
              onValueChange={(option) =>
                handleChange("duration", option.value.toString())
              }
              placeholder="Select duration"
            />
          </div>
          <div>
            <label className="text-md text-black">Interest Rate (%)</label>
            <Dropdown
              options={interestRateOptions}
              onValueChange={(option) =>
                handleChange("interestRate", option.value.toString())
              }
              placeholder="Select interest rate"
            />
          </div>
          <button
            type="submit"
            className={`w-max mx-auto mt-6 px-8 py-3 rounded-xl ${
              isLoading ? "bg-gray-500" : "bg-black text-white"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </Modal>
  );
}
