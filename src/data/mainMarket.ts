export const marketData = [
  {
    caution: "./images/caution.svg",
    alert: "./images/alert.svg",
    image: "./images/sol.svg",
    asset: "SOL",
    price: "$177.08",
    maxTVL: "$1,000,000",
    deposits: "$500,000",
    supplyAPY: "5%",
    borrowAPY: "3%",
    cap: 20,
    balance: 2000
  },
  {
    caution: "./images/caution.svg",
    alert: "./images/alert.svg",
    image: "./images/nyan.svg",
    asset: "NYAN",
    price: "$0.0632",
    maxTVL: "$800,000",
    deposits: "$400,000",
    supplyAPY: "4%",
    borrowAPY: "2.5%",
    cap: 68,
    balance: 2000
  },
  {
    caution: "./images/caution.svg",
    alert: "./images/alert.svg",
    image: "./images/tensor.svg",
    asset: "TNSR",
    price: "$0.43",
    maxTVL: "$600,000",
    deposits: "$300,000",
    supplyAPY: "6%",
    borrowAPY: "4%",
    cap: 25,
    balance: 2000
  },
  {
    caution: "./images/caution.svg",
    alert: "./images/alert.svg",
    image: "./images/kamino.svg",
    asset: "KMN",
    price: "$0.22",
    maxTVL: "$1,200,000",
    deposits: "$700,000",
    supplyAPY: "3%",
    borrowAPY: "2%",
    cap: 85,
    balance: 2000
  },
  {
    caution: "./images/caution.svg",
    alert: "./images/alert.svg",
    image: "./images/orca.svg",
    asset: "ORCA",
    price: "$2.05",
    maxTVL: "$1,200,000",
    deposits: "$700,000",
    supplyAPY: "3%",
    borrowAPY: "2%",
    cap: 72,
    balance: 2000
  },
  {
    caution: "./images/caution.svg",
    alert: "./images/alert.svg",
    image: "./images/zeta.svg",
    asset: "ZETA",
    price: "$0.06",
    maxTVL: "$1,200,000",
    deposits: "$700,000",
    supplyAPY: "3%",
    borrowAPY: "2%",
    cap: 85,
    balance: 2000
  },
  {
    caution: "./images/caution.svg",
    alert: "./images/alert.svg",
    image: "./images/wormhole.svg",
    asset: "W",
    price: "$0.33",
    maxTVL: "$1,200,000",
    deposits: "$700,000",
    supplyAPY: "3%",
    borrowAPY: "2%",
    cap: 45,
    balance: 2000
  },
  {
    caution: "./images/caution.svg",
    alert: "./images/alert.svg",
    image: "./images/zeus.svg",
    asset: "ZEUS",
    price: "$0.0004",
    maxTVL: "$1,200,000",
    deposits: "$1,180,000",
    supplyAPY: "3%",
    borrowAPY: "2%",
    cap: 80,
    balance: 2000
  },
  {
    caution: "./images/caution.svg",
    alert: "./images/alert.svg",
    image: "./images/drift.svg",
    asset: "DRIFT",
    price: "$0.20",
    maxTVL: "$1,200,000",
    deposits: "$700,000",
    supplyAPY: "3%",
    borrowAPY: "2%",
    cap: 90,
    balance: 2000
  },
];

export interface MainMarketProps  {
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
