"use client";
import React from "react";

interface Filters {
  token: string;
  amount: string;
  interestRate: string;
  duration: string;
}

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (field: keyof Filters, value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4">
      {/* Filter by Token */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1">Token</label>
        <select
          className="px-2 py-1 border rounded"
          value={filters.token}
          onChange={(e) => onFilterChange("token", e.target.value)}
        >
          <option value="">All Tokens</option>
          <option value="STRK">STRK</option>
          <option value="ETH">ETH</option>
          {/* Add more tokens if needed */}
        </select>
      </div>

      {/* Filter by Amount (Net Value) */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1">Min Amount</label>
        <input
          type="number"
          className="px-2 py-1 border rounded"
          placeholder="e.g. 100"
          value={filters.amount}
          onChange={(e) => onFilterChange("amount", e.target.value)}
        />
      </div>

      {/* Filter by Interest Rate */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1">Min Interest (%)</label>
        <input
          type="number"
          className="px-2 py-1 border rounded"
          placeholder="e.g. 5"
          value={filters.interestRate}
          onChange={(e) => onFilterChange("interestRate", e.target.value)}
        />
      </div>

      {/* Filter by Duration (days) */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1">Min Duration (days)</label>
        <input
          type="number"
          className="px-2 py-1 border rounded"
          placeholder="e.g. 30"
          value={filters.duration}
          onChange={(e) => onFilterChange("duration", e.target.value)}
        />
      </div>
    </div>
  );
};

export default FilterBar;
