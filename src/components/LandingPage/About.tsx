import Image from "next/image";

const About = () => {
  return (
    <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl px-8 w-full mx-auto text-white shadow-lg">
      <details className="mb-4 cursor-pointer group py-10 border-b border-gray-700">
        <summary className="lg:text-3xl font-light flex justify-between items-center text-base">
          Gradual Liquidation Process
          <Image
            src="./images/DownArrow.svg"
            className="group-open:rotate-[50deg] transition-transform"
            width={70}
            height={200}
            alt=""
          />
        </summary>
        <p className="mt-2 ml-4 lg:text-xl font-thin font-opensans text-sm">
          To ensure fair market value for collateral, our platform employs limit
          order liquidations. Instead of executing immediate market sell orders,
          limit orders are placed at specified prices, minimizing slippage and
          maximizing returns for users during liquidation events
        </p>
      </details>

      <details className="mb-4 cursor-pointer group py-10 border-b border-gray-700">
        <summary className="lg:text-3xl tracking-wide font-extralight flex justify-between items-center text-base">
          Dynamic Proposal System
          <Image
            src="./images/DownArrow.svg"
            className="group-open:rotate-[50deg] transition-transform"
            width={70}
            height={200}
            alt=""
          />
        </summary>
        <p className="mt-2 ml-4 lg:text-xl font-thin font-opensans text-sm">
          Users on our platform have the ability to create proposals for lending
          terms or counter existing proposals, fostering a dynamic and
          collaborative lending environment. This feature enables borrowers to
          suggest personalized terms for their loans, while lenders can respond
          with competitive offers tailored to their preferences. Through this
          proposal system, users can negotiate and finalize lending agreements
          that suit their individual needs and optimize their financial
          transactions.
        </p>
      </details>

      <details className="mb-4 cursor-pointer group py-10 border-b border-gray-700">
        <summary className="lg:text-3xl tracking-wide font-extralight flex justify-between items-center text-base">
          Immutable Deal Creation
          <Image
            src="./images/DownArrow.svg"
            className="group-open:rotate-[50deg] transition-transform"
            width={70}
            height={200}
            alt=""
          />
        </summary>
        <p className="mt-2 ml-4 lg:text-xl font-thin font-opensans text-sm">
          Details about immutable deal creation.
        </p>
      </details>

      <details className="cursor-pointer group py-10">
        <summary className="lg:text-3xl tracking-wide font-extralight flex justify-between items-center text-base">
          Decentralized Peer-to-Peer Lending Deals
          <Image
            src="./images/DownArrow.svg"
            className="group-open:rotate-[50deg] transition-transform"
            width={70}
            height={200}
            alt=""
          />
        </summary>
        <p className="mt-2 ml-4 lg:text-xl font-thin font-opensans text-sm">
          Peer Protocols decentralized peer-to-peer marketplace serves as the
          cornerstone of the app. It allows users to directly connect and
          transact with each other without intermediaries. This feature enables
          borrowers to access loans and lenders to offer funds, fostering a
          dynamic and inclusive financial ecosystem.
        </p>
      </details>
    </div>
  );
};

export default About;
