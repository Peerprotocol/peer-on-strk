import { useState } from "react";
import Image from "next/image";
import Nav from "../Nav";
import Sidebar from "../sidebar";
import { BorrowerData } from "../../../data/BorrowerData";

// Constants
const ITEMS_PER_PAGE = 7;

// Component for the header section
const Header = () => (
  <div className="flex gap-3 items-center p-4">
    <Image
      src="/images/back-button.svg"
      height={40}
      width={40}
      alt="back-button"
      className="cursor-pointer"
    />
    <div className="flex gap-2 pb-2">
      <p className="text-black text-4xl">Borrower&apos;s Market</p>
    </div>
  </div>
);

// Component for the table header
const TableHeader = () => (
  <div className="grid grid-cols-5 pt-6 rounded-t-xl bg-smoke-white py-4">
    <div className="text-center font-semibold">Borrower</div>
    <div className="text-center font-semibold">Amount Needed</div>
    <div className="text-center font-semibold">Interest Rate</div>
    <div className="text-center font-semibold">Term</div>
    <div className="text-center font-semibold">Credit Score</div>
  </div>
);

// Component for individual table rows
const TableRow = ({ row }: {row: any}) => (
  <div className="contents">
    <div className="flex justify-center text-center px-4 py-6 border-t border-gray-300 gap-2">
      <p className="font-medium">{row.borrowers}</p>
      <Image
        src="/images/phantom-icon.svg"
        height={20}
        width={20}
        alt="phantomicon"
      />
    </div>
    <div className="text-center px-4 py-6 border-t border-gray-300">
      <p className="font-medium">{row.amountNeeded}</p>
    </div>
    <div className="text-left mx-[4.5rem] px-4 py-6 border-t border-gray-300">
      <p className="font-medium">{row.quantity}</p>
    </div>
    <div className="text-center px-4 py-6 border-t border-gray-300">
      <p className="font-medium">{row.interestRate}%</p>
    </div>
    <div className="text-center px-4 py-6 border-t border-gray-300">
      <p className="font-medium">{row.term} days</p>
    </div>
    <div className="text-center px-4 py-6 border-t border-gray-300">
      <p className="font-medium">{row.quantity}</p>
    </div>
    <button className="px-2 text-sm rounded-lg bg-[rgba(0,0,0,0.8)] my-5 mx-auto text-white w-20 h-8">
      Apply
    </button>
  </div>
);

// Component for the create proposal button
const CreateProposalButton = ({
  onClick,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  onClick: () => void;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => (
  <button
    onClick={onClick}
    className="relative flex items-center gap-2 px-6 py-3 rounded-3xl bg-[#F5F5F5] text-black border border-[rgba(0,0,0,0.8)] mx-auto font-light hover:bg-[rgba(0,0,0,0.8)] hover:text-white"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <p>Create a Proposal</p>
    <Image
      src={isHovered ? "/images/MathPlusHover.png" : "/images/PlusMath.svg"}
      height={40}
      width={20}
      alt="plus"
      className="transition-opacity duration-300 ease-in-out"
    />
  </button>
);

// Component for pagination
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => (
  <div className="flex justify-end p-4">
    <div className="flex gap-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          className={`px-4 py-2 ${
            currentPage === index + 1
              ? "bg-[rgba(0,0,0,0.8)] text-white"
              : "bg-[#F5F5F5] text-black border-black border-2"
          } rounded-lg`}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  </div>
);

// Main BorrowersMarket Component
const BorrowersMarket = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  // Calculations
  const totalPages = Math.ceil(BorrowerData.length / ITEMS_PER_PAGE);
  const currentData = BorrowerData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Event handlers
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <main className="bg-[#F5F5F5]">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
          <Nav />
          <Header />
          
          <div className="overflow-x-auto text-black border mx-4 mb-4">
            <TableHeader />
            <div className="w-full grid grid-cols-5 rounded-b-xl text-gray-800">
              {currentData.map((row, index) => (
                <TableRow key={index} row={row} />
              ))}
            </div>
          </div>

          <CreateProposalButton
            onClick={handleOpenModal}
            isHovered={isHovered}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </main>
  );
};

export default BorrowersMarket;