import React from "react";
import TransactionHistory from "./transactionTab";
import PositionOverview from "./positionTab";

const History = () => {
  const [activeTab, setActiveTab] = React.useState("tab1");
  // render component based on state
  const handleRenderTab = () => {
    switch (activeTab) {
      case "tab1":
        return <PositionOverview />;
      case "tab2":
        return <TransactionHistory />;
      default:
        return null;
    }
  }

  return (
    <section className="max-w-[1093px] h-[210px] text-black">
      <div className="flex gap-2 mb-4 lg:mb-6">
        <p
          className={`inline-flex py-2 px-3 rounded-[10px] items-center gap-1 font-medium text-xs cursor-pointer ${
            activeTab === "tab1" ? "bg-black text-white" : "text-black"
          }`}
          onClick={() => setActiveTab("tab1")}
        >
          Position Overview
        </p>
        <p
          className={`inline-flex py-2 px-3 rounded-[10px] items-center gap-1 font-medium text-xs cursor-pointer ${
            activeTab === "tab2" ? "bg-black text-white" : "text-black"
          }`}
          onClick={() => setActiveTab("tab2")}
        >
          Transaction History
        </p>
      </div>
      {handleRenderTab()}
    </section>
  );
};

export default History;