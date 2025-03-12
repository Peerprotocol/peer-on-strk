import { MoveDownRight } from "lucide-react";
import { useContext } from "react";
import { DarkModeContext } from "./DarkMode";

const About = () => {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <div
      className={`rounded-2xl px-8 w-full mx-auto shadow-lg ${isDarkMode
        ? "bg-gradient-to-br from-white to-gray-100 text-black"
        : "bg-gradient-to-br from-black to-gray-900 text-white"
        }`}
    >
      <details className="mb-4 cursor-pointer group py-10 border-b border-gray-700">
        <summary className="lg:text-3xl tracking-wide font-light flex justify-between items-center text-base">
          Gradual Liquidation Process
          <MoveDownRight
            className="group-open:rotate-[85deg] 
                 group-open:scale-50 
                 w-[50px] 
                 lg:w-[60px] 
                 transition-transform 
                 duration-800 
                 ease-in-out"
            size={60}
            strokeWidth={1.25}
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
        <summary className="lg:text-3xl tracking-wide font-light flex justify-between items-center text-base">
          Dynamic Proposal System
          <MoveDownRight
            className="group-open:rotate-[85deg] 
                 group-open:scale-50 
                 w-[50px] 
                 lg:w-[60px] 
                 transition-transform 
                 duration-800 
                 ease-in-out"
            size={60}
            strokeWidth={1.25}
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
        <summary className="lg:text-3xl tracking-wide font-light flex justify-between items-center text-base">
          Immutable Deal Creation
          <MoveDownRight
            className="group-open:rotate-[85deg] 
                 group-open:scale-50 
                 w-[50px] 
                 lg:w-[60px] 
                 transition-transform 
                 duration-800 
                 ease-in-out"
            size={60}
            strokeWidth={1.25}
          />
        </summary>
        <p className="mt-2 ml-4 lg:text-xl font-thin font-opensans text-sm">
          Details about immutable deal creation.
        </p>
      </details>

      <details className="cursor-pointer group py-10">
        <summary className="lg:text-3xl tracking-wide font-light flex justify-between items-center text-base">
          Decentralized Peer-to-Peer Lending Deals
          <MoveDownRight
            className="group-open:rotate-[85deg] 
                 group-open:scale-50 
                 w-[50px] 
                 lg:w-[60px] 
                 transition-transform 
                 duration-800 
                 ease-in-out"
            size={60}
            strokeWidth={1.25}
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