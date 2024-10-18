import React, { useState } from "react";
import { tableData } from "../../../data/TransactionHistory";
import Image from "next/image";
import PageRight from "../../../../public/images/pageright.svg"
import PageLeft from "../../../../public/images/pageleft.svg"

const Table: React.FC = () => {
    // State to manage the active tab
    const [activeTab, setActiveTab] = useState("Transaction History");

    // Pagination setup
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    // Filter data based on the active tab
    const getDataForActiveTab = () => {
        switch (activeTab) {
            case "Transaction History":
                return tableData;
            case "Assets":
            case "Position Overview":
                // Return an empty array for tabs without data
                return [];
            default:
                return [];
        }
    };

    // Get the data for the current page
    const dataForCurrentTab = getDataForActiveTab();
    const totalPages = Math.ceil(dataForCurrentTab.length / rowsPerPage);
    const currentRows = dataForCurrentTab.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Logic for pagination with 5 buttons visible
    const maxVisibleButtons = 5;
    const startPage = Math.floor((currentPage - 1) / maxVisibleButtons) * maxVisibleButtons + 1;
    const endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="p-6">
            {/* Buttons: Assets, Position Overview, Transaction History, Filter */}
            <div className="mb-6 flex justify-between mt-3 gap-4">
                <div className="flex flex-wrap md:flex-row space-x-2 md:space-x-4">
                    <button
                        className={`px-4 py-2 rounded-full ${activeTab === "Assets" ? "bg-black text-white" : "bg-transparent text-black"}`}
                        onClick={() => {
                            setActiveTab("Assets");
                            setCurrentPage(1); // Reset to first page when changing tabs
                        }}
                    >
                        Assets
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full ${activeTab === "Position Overview" ? "bg-black text-white" : "bg-transparent text-black"}`}
                        onClick={() => {
                            setActiveTab("Position Overview");
                            setCurrentPage(1); // Reset to first page when changing tabs
                        }}
                    >
                        Position Overview
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full ${activeTab === "Transaction History" ? "bg-black text-white" : "bg-transparent text-black"}`}
                        onClick={() => {
                            setActiveTab("Transaction History");
                            setCurrentPage(1); // Reset to first page when changing tabs
                        }}
                    >
                        Transaction History
                    </button>
                </div>
                <div>
                    <select className="px-4 py-2 border rounded-full text-black">
                        <option value="borrow">Borrow</option>
                        <option value="lend">Lend</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto text-black my-6">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border bg-smoke-white">
                            <th className="p-4 text-left border-b font-semibold">
                                Transaction Type
                            </th>
                            <th className="p-4 text-left border-b font-semibold">Market</th>
                            <th className="p-4 text-left border-b font-semibold">Quantity</th>
                            <th className="p-4 text-left border-b font-semibold">Value ($)</th>
                            <th className="p-4 text-left border-b font-semibold">
                                Interest (%)
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataForCurrentTab.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4 text-center" style={{ minHeight: '100px' }}>
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            currentRows.map((row, index) => (
                                <tr key={index}>
                                    <td className="p-4 border-b border-l">{row.transactionType}</td>
                                    <td className="p-4 border-b flex items-center">
                                        <Image
                                            src={row.marketImage}
                                            alt={row.marketName}
                                            width={24}
                                            height={24}
                                            className="rounded-full mr-2"
                                        />
                                        {row.marketName}
                                    </td>
                                    <td className="p-4 border-b">{row.quantity}</td>
                                    <td className="p-4 border-b">{row.value}</td>
                                    <td className="p-4 border-b border-r">{row.interest}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Component */}
            {dataForCurrentTab.length > 0 && (
                <div className="flex justify-end mt-4 items-center">
                    {/* Previous button */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`mx-1 px-4 py-2 border text-black rounded-md ${currentPage === 1 ? "cursor-not-allowed" : ""}`}
                    >
                        <Image src={PageLeft} height={20} width={20} alt="Previous" />
                    </button>

                    {/* Visible page buttons */}
                    {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
                        const page = startPage + index;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`mx-1 px-4 py-2 border rounded-md ${currentPage === page ? "bg-black text-white" : "bg-white text-black"}`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    {/* Next button */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`mx-1 px-4 py-2 border text-black rounded-md ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                        <Image src={PageRight} height={20} width={20} alt="Next" />
                    </button>
                </div>
            )}

        </div>
    );
};

export default Table;
