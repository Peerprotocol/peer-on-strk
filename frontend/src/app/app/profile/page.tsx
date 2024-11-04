"use client";
import DepositWithdrawPeer from './DepositWithdrawPeer';
import React from 'react';
import Nav from "../Nav";
import Sidebar from "../sidebar";
import Dashboard from './Dashboard';
import Table from './Table';
import Footer from '../footer';
import CryptoAnalyticsChart from './CryptoAnalyticsChart';
import { useAccount } from '@starknet-react/core';
import ConnectButton from '@/components/lib/Connect';

const Profile = () => {

  const { address } = useAccount();

  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      <div className="flex">
        <Sidebar />
        <div className="w-full md:flex-1 flex flex-col">
          <Nav />
          {/* <div></div> */}
          {
            address ?
              <>
                <div className='flex flex-col xl:flex-row gap-6 py-6 px-3 md:px-8'>
                  {/* <div className="w-full md:flex-wrap md:basis-[70%] flex">
                  </div> */}
                  <Dashboard />
                  <div className="w-full md:flex-grow md:basis-[30%] flex">
                    <DepositWithdrawPeer />
                  </div>
                </div>
                <CryptoAnalyticsChart />
                <Table />
              </>
              :
              <>
                <ConnectButton className="my-auto md:py-6 md:w-[30%] self-center text-2xl font-extrabold "/>
              </>
          }
          <Footer />
        </div>
      </div>
    </main>
  );
};

export default Profile;