"use client";
import DepositWithdrawPeer from './DepositWithdrawPeer';
import React from 'react';
import Nav from "../Nav";
import Sidebar from "../sidebar";
import Dashboard from '../../app/profile/Dashboard';
import Table from './Table';
import Footer from '../footer';
import CryptoAnalyticsChart from './CryptoAnalyticsChart';

const profile = () => {
  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      <div className="flex">
        <Sidebar />
        <div className="w-full md:flex-1 flex flex-col">
          <Nav />
          <div className='flex flex-col xl:flex-row gap-6 py-6 px-3 md:px-8'>
            <div className="w-full md:flex-wrap md:basis-[70%] flex">
              <Dashboard />
            </div>
            <div className="w-full md:flex-grow md:basis-[30%] flex">
              <DepositWithdrawPeer />
            </div>
          </div>
          <CryptoAnalyticsChart/>
          <Table />
          <Footer/>
        </div>
      </div>
    </main>
  );
};

export default profile;