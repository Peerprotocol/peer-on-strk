import React, { useState } from "react";
import Table from "./Table";
import { infoTableLabels } from "@/lib/data";
import { toast } from "react-toastify";
// import { infoDataType } from "@/lib/types";

const InfoTable = ({ tableItems }: { tableItems: any[] }) => {
  const [selectedPubKey, setSelectPubKey] = useState("");

  const acceptLoanIdx = async (item: any) => {
    setSelectPubKey(item.publicKey.toString());
   
  };

  return (
    <>
      {!!tableItems.length && (
        <Table tableLabels={infoTableLabels} extraColumms={1}>
          {tableItems.map((item, index) => (
            <tr className="[*&>td]:py-4" key={index}>
              <td>{item.lender}</td>
              <td>{item.assets ?? "USDC"}</td>
              <td>{item.amount / 10 ** 6}</td>
              <td>{item.interestRate}</td>
              <td>{item.duration.toString()}</td>
              <td>
                <button
                  className="border border-white rounded-full p-3 px-6"
                  onClick={(e) => acceptLoanIdx(item)}
                  // disabled={result <= 80}
                >
                  {
                   
                   "Borrow"}
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
};

export default InfoTable;
