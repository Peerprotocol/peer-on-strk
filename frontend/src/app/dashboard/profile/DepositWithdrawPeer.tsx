'use client'

import Image from "next/image"
import React, { useState, useCallback } from 'react'
import { uint256 } from 'starknet'
import { useContract, useAccount, useNetwork, useContractRead } from '@starknet-react/core'
import { toast as hotToast } from 'react-hot-toast'
import { toast as toastify } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import protocolAbi from "../../../../public/abi/protocol.json"
import mockTokenAbi from "../../../../public/abi/mock_token.json"
import Erc20Abi from "../../../../public/abi/token.abi.json"
import Logo from "../../../../public/images/LogoBlack.svg"
import STRK from "../../../../public/images/starknet.png"
import ETH from "../../../../public/images/ethereumlogo.svg"
import { ChevronDown, Cog } from "lucide-react"
import { formatCurrency } from "@/components/internal/helpers"
import { PROTOCOL_ADDRESS } from "@/components/internal/helpers/constant";

const TOKEN_ADDRESSES = {
  STRK: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
}

interface TokenInfo {
  symbol: string
  address: string
  icon: any
  decimals: number
}

export default function DepositWithdrawPeer() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [isTokenOpen, setIsTokenOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState("Deposit")
  const [selectedToken, setSelectedToken] = useState<TokenInfo>({
    symbol: "STRK",
    address: TOKEN_ADDRESSES.STRK,
    icon: STRK,
    decimals: 18
  })

  const { account, address } = useAccount()
  const { data: eth, isLoading: ethLoading } = useContractRead({
    address: TOKEN_ADDRESSES.ETH,
    abi: Erc20Abi,
    functionName: "balanceOf",
    args: [address!],
    watch: true,
  })

  const { data: strk, isLoading: strkLoading } = useContractRead({
    address: TOKEN_ADDRESSES.STRK,
    abi: Erc20Abi,
    functionName: "balanceOf",
    args: [address!],
    watch: true,
  })

  const { data: userAssets } = useContractRead({
    address: PROTOCOL_ADDRESS,
    abi: protocolAbi,
    functionName: "get_user_assets",
    args: [address!],
    watch: true,
  })

  const getBalance = useCallback(() => {
    if (selectedOption === "Deposit") {
      if (selectedToken.symbol === "STRK") {
        return strk ? Number(formatCurrency(strk.balance?.low.toString())) : 0;
      } else {
        return eth ? Number(formatCurrency(eth.balance?.low.toString())) : 0;
      }
    } else {
      if (!userAssets || !userAssets.length) return 0;

      const selectedTokenBigInt = BigInt(selectedToken.address);

      const asset = userAssets.find((asset: any) =>
        BigInt(asset.token_address) === selectedTokenBigInt
      );

      if (!asset) return 0;

      // @ts-ignore
      return Number(formatCurrency(asset.available_balance.toString()));

    }
  }, [selectedOption, selectedToken, eth, strk, userAssets]);

  const handlePercentageClick = (percentage: number) => {
    const balance = getBalance()
    const newAmount = (balance * percentage) / 100;
    const roundedAmount = newAmount.toFixed(3)
    setAmount(roundedAmount.toString())
  }

  const tokens: TokenInfo[] = [
    {
      symbol: "STRK",
      address: TOKEN_ADDRESSES.STRK,
      icon: STRK,
      decimals: 18
    },
    {
      symbol: "ETH",
      address: TOKEN_ADDRESSES.ETH,
      icon: ETH,
      decimals: 18
    }
  ]

  const { contract: tokenContract } = useContract({
    abi: mockTokenAbi,
    address: selectedToken.address,
  })

  const { contract: protocolContract } = useContract({
    abi: protocolAbi,
    address: PROTOCOL_ADDRESS,
  })

  const getUint256FromDecimal = (decimalAmount: string) => {
    try {
      const amount = Number(decimalAmount)
      const multiplied = amount * Math.pow(10, selectedToken.decimals)
      return uint256.bnToUint256(multiplied.toString())
    } catch (err) {
      throw new Error('Invalid amount format')
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleDeposit = async () => {
    if (!protocolContract || !account) {
      hotToast.error('Address space is empty');
      return;
    }
  
    try {
      setLoading(true);
      const amountUint256 = getUint256FromDecimal(amount);
      const depositCall = protocolContract.populate('deposit', [
        selectedToken.address,
        amountUint256
      ]);
  
      const depositTx = await account.execute(depositCall);
      await account.waitForTransaction(depositTx.transaction_hash);
  
      // Record transaction in DB
      await fetch('/api/database/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: account.address,
          token: selectedToken.address,
          amount: amount,
          transaction_type: 'deposit'
        })
      });
  
      toastify.success('Deposit successful');
      setAmount(''); // Reset amount after successful deposit
    } catch (err: any) {
      hotToast.error(`Deposit failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  const handleWithdraw = async () => {
    if (!protocolContract || !account) {
      hotToast.error('Wallet not connected');
      return;
    }
  
    try {
      setLoading(true);
  
      const amountUint256 = getUint256FromDecimal(amount);
      const withdrawCall = protocolContract.populate('withdraw', [
        selectedToken.address,
        amountUint256
      ]);
  
      const withdrawTx = await account.execute(withdrawCall);
      await account.waitForTransaction(withdrawTx.transaction_hash);
  
      // Record transaction in DB
      await fetch('/api/database/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: account.address,
          token: selectedToken.address,
          amount: amount,
          transaction_type: 'withdraw'
        })
      });
  
      toastify.success('Withdrawal successful');
      setAmount(''); // Reset amount after successful withdrawal
    } catch (err: any) {
      hotToast.error(`Withdrawal failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  const handleActionSelect = (option: string) => {
    setSelectedOption(option)
    setIsActionOpen(false)
    setAmount('') // Reset amount when switching between deposit/withdraw
  }

  const handleTokenSelect = (token: TokenInfo) => {
    setSelectedToken(token)
    setIsTokenOpen(false)
    setAmount('') // Reset amount when switching tokens
  }

  const marketOptions = ["Deposit", "Withdraw"]

  return (
    <div className='border border-[#0000001A] bg-white p-6 rounded-[1rem] md:flex-grow flex-col relative text-black w-full md:h-full'>
      <div className='pb-4 flex justify-end'>
        <div className='flex items-center border py-2 px-4 rounded-3xl border-black cursor-pointer' onClick={() => setIsActionOpen(!isActionOpen)}>
          {selectedOption}
          <ChevronDown size={22} color="#000000" strokeWidth={1.25} />
        </div>
        {isActionOpen && (
          <div className="absolute mt-10 w-[7rem] md:w-[8.5rem] rounded-md shadow-lg bg-white z-20">
            <div className="py-1">
              {marketOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleActionSelect(option)}
                  className={`block w-full text-left px-4 py-2 text-sm ${option === selectedOption ? "bg-gray-100" : ""} hover:bg-gray-50`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <hr className='border-t pb-4' />
      <div className='py-2 px-6 rounded-lg bg-[#efefef]'>
        <div className='flex justify-between mb-4'>
          <p>Your {selectedOption.toLowerCase()}</p>
          <div className=''>
            <p className='text-xs text-right'>Priority fee</p>
            <div className='flex items-center border px-3 py-1 rounded-3xl bg-[#0000000D]'>
              <p className='text-xs'>Minimum</p>
              <Cog size={15} className="m-0.5" color="#000000" strokeWidth={2.25} />
            </div>
          </div>
        </div>
        <div className='flex gap-4 w-full'>
          <div
            className='flex items-center justify-center bg-[#0000000D] py-2 px-4 rounded-xl cursor-pointer'
            onClick={() => setIsTokenOpen(!isTokenOpen)}
          >
            <div className="flex gap-3 items-center">
              <Image src={selectedToken.icon} width={25} height={25} alt={`${selectedToken.symbol}-Image`}/>
              <p className='mr-2'>{selectedToken.symbol}</p>
            </div>
            <div className='flex-shrink-0 pl-6'>
              <ChevronDown size={22} color="#000000" strokeWidth={1.85} />
            </div>
          </div>

          {isTokenOpen && (
            <div className="absolute mt-16 w-[12rem] rounded-md shadow-lg bg-white z-10">
              <div className="py-1">
                {tokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleTokenSelect(token)}
                    className={`block w-full text-left px-4 py-2 text-sm ${token.symbol === selectedToken.symbol ? "bg-gray-100" : ""} hover:bg-gray-50 flex items-center gap-2`}
                  >
                    <Image src={token.icon} width={20} height={20} alt={`${token.symbol}-Image`}/>
                    {token.symbol}
                  </button>
                ))}
              </div>
            </div>
          )}

          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="text-right text-[1.4rem] font-bold bg-transparent outline-none w-[60%] md:w-auto"
          />
        </div>
        <p className='text-xs'>Available: {getBalance()}</p>
        <div className='flex gap-2 justify-end'>
          {[25, 50, 75, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => handlePercentageClick(percent)}
              className='bg-[#0000000D] text-xs px-2 py-1 rounded-md hover:bg-[#0000001A]'
            >
              {percent}%
            </button>
          ))}
        </div>
      </div>
      <button
        className={`bg-black text-white rounded-full w-full py-3 mt-4 ${loading ? 'opacity-50' : 'hover:bg-gray-800'}`}
        onClick={selectedOption === "Deposit" ? handleDeposit : handleWithdraw}
        disabled={loading}
      >
        {loading ? 'Processing...' : selectedOption}
      </button>
      <div className='flex justify-center gap-2 mt-4'>
        <p className='text-xs opacity-50'>Powered by Peer Protocol</p>
        <Image src={Logo} height={15} width={15} alt='logo-icon' />
      </div>
    </div>
  )
}