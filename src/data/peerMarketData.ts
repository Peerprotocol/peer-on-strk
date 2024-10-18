export const peerMarketData = [
    {
      caution: "./images/caution.svg",
      alert: "./images/alert.svg",
      image: "/images/bitcoin.png",
      asset: "BTC",
      price: "$35,000.00",
      maxTVL: "$2,500,000",
      deposits: "$1,200,000",
      supplyAPY: "",
      borrowAPY: "",
      cap: 40,
      balance: 5000
    },
    {
      caution: "./images/caution.svg",
      alert: "./images/alert.svg",
      image: "/images/eth.png",
      asset: "ETH",
      price: "$2,300.00",
      maxTVL: "$1,800,000",
      deposits: "$900,000",
      supplyAPY: "",
      borrowAPY: "",
      cap: 60,
      balance: 4500
    },
    {
      caution: "./images/caution.svg",
      alert: "./images/alert.svg",
      image: "/images/usdt.png",
      asset: "USDT",
      price: "$1.00",
      maxTVL: "$1,500,000",
      deposits: "$1,000,000",
      supplyAPY: "",
      borrowAPY: "",
      cap: 50,
      balance: 10000
    },
    {
      caution: "./images/caution.svg",
      alert: "./images/alert.svg",
      image: "/images/avax.png",
      asset: "AVAX",
      price: "$25.00",
      maxTVL: "$1,200,000",
      deposits: "$800,000",
      supplyAPY: "",
      borrowAPY: "",
      cap: 75,
      balance: 3000
    },
    {
      caution: "./images/caution.svg",
      alert: "./images/alert.svg",
      image: "/images/dot.png",
      asset: "DOT",
      price: "$6.30",
      maxTVL: "$1,000,000",
      deposits: "$600,000",
      supplyAPY: "",
      borrowAPY: "",
      cap: 65,
      balance: 2000
    },
    {
      caution: "./images/caution.svg",
      alert: "./images/alert.svg",
      image: "/images/ada.png",
      asset: "ADA",
      price: "$0.35",
      maxTVL: "$800,000",
      deposits: "$400,000",
      supplyAPY: "",
      borrowAPY: "",
      cap: 55,
      balance: 2500
    },
    {
      caution: "./images/caution.svg",
      alert: "./images/alert.svg",
      image: "/images/link.png",
      asset: "LINK",
      price: "$8.50",
      maxTVL: "$900,000",
      deposits: "$500,000",
      supplyAPY: "",
      borrowAPY: "",
      cap: 70,
      balance: 1800
    },
    {
      caution: "./images/caution.svg",
      alert: "./images/alert.svg",
      image: "/images/ftm.png",
      asset: "FTM",
      price: "$0.45",
      maxTVL: "$700,000",
      deposits: "$350,000",
      supplyAPY: "",
      borrowAPY: "",
      cap: 80,
      balance: 4000
    },
    {
      caution: "./images/caution.svg",
      alert: "./images/alert.svg",
      image: "/images/matic.png",
      asset: "MATIC",
      price: "$1.20",
      maxTVL: "$1,000,000",
      deposits: "$600,000",
      supplyAPY: "",
      borrowAPY: "",
      cap: 45,
      balance: 3500
    },
  ];
  
  export interface MainMarketProps {
    caution: string;
    alert: string;
    image: string;
    asset: string;
    price: string;
    maxTVL: string;
    deposits: string;
    supplyAPY: string;
    borrowAPY: string;
    cap: number;
    balance: number;
  }
  