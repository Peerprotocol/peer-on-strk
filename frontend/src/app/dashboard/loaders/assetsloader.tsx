import React from 'react';

const AssetsLoader = () => {
  return (
    <div className="flex flex-col space-y-4 p-4 animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
    </div>
  );
};

export default AssetsLoader;
