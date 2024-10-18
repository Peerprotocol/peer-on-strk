import React from "react";
import Image from "next/image";
import Info from "../../../../public/images/info.svg";
import { dashboardItems } from "../../../data/DashboardData"; // Import the data

const Dashboard = () => {
  return (
    <div className="border border-gray-200 rounded-[1rem] flex flex-col gap-6 md:p-6 p-2 bg-white w-full">
      {/* Dashboard Items Container */}
      <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4 3xl:gap-[2rem] w-full">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 p-6 rounded-xl mt-4 bg-smoke-white relative flex flex-col justify-center w-full lg:w-[calc(51%-1rem)] 3xl:w-[48%]" // Set 33% width for lg screens
          >
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className="text-[2.2rem] font-semibold text-black pb-8">
              {item.value}
            </p>

            {/* Info Icon */}
            {item.info && (
              <Image
                src={Info}
                height={20}
                width={20}
                alt="info-icon"
                className="cursor-pointer absolute top-2 right-3"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
