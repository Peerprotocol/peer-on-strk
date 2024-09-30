"use client";

import React from "react";
import LendInfoTable from "./lendinfo";
import { tableData } from "@/lib/data";
import Pagination from "./Pagination";
import usePagination from "@/lib/hooks/usePagination";
import { infoDataType } from "@/lib/types";
import { PAGE_SIZE } from "@/lib/constants";

const LendComponent = () => {

  const {
    paginatedItems: paginatedTableData,
    totalPages,
    setPage,
    currentPage,
  } = usePagination<infoDataType>(1, tableData, PAGE_SIZE);
  return (
    <div className="w-full">
      <div className="bg-[#FFFFFF0D] p-4 rounded-xl mb-3 pb-6">
        <LendInfoTable tableItems={paginatedTableData} />
      </div>
      <div className="flex justify-end">
        <Pagination
          setPage={setPage}
          lastPage={totalPages}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default LendComponent;
