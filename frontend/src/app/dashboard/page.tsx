"use client";
import Sidebar from "../../components/custom/sidebar";
import Dashboard from "../../components/custom/dashboard";
import Market from "../../components/custom/market";
import Footer from "../../components/custom/footer";
import Nav from "../../components/custom/Nav";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Home() {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenWalkthrough = localStorage.getItem("hasSeenWalkthrough");
    if (!hasSeenWalkthrough) {
      setShowWalkthrough(true);
    }
  }, []);

  const walkthroughSteps = [
    {
      title: "Welcome to Peer Protocol",
      description: "Peer Protocol is a decentralized lending platform built on Starknet. With Peer protocol, you can borrow and lend tokens on the starknet ecosystem efficiently using our peer-to-peer model.",
      image: '/images/peer-protocol.png'
    },
    {
      title: "First, let's complete your profile",
      description: "Help us complete your profile by connecting your wallet and giving us your email and your twitter username (e.g @i_amprof).",
       image: '/images/complete-profile.png'
    },
    {
      title: "Now let's borrow some tokens",
      description: "Click on the borrow button and check for a proposal that fits your requirements. If you dont see one, click on create borrow proposal, make a deposit (at least 2x the amount you want to borrow), and then fill in the details for the proposal.",
      image: '/images/borrow.png'
    },
    {
      title: "Want to repay your loan, we've got you",
      description: "Head on to the portfolio page from the sidebar, scroll down to the transaction history and toggle the tab to Position Overview, here you would see the open loans you have, clicking on the repay button would prompt you to repay your loan. PS: (You can repay in bits).",
      image: '/images/position-overview.png'
    },
    {
      title: "Want to withdraw your money?",
      description: "You can withdraw your money from the portfolio page, just toggle the deposit box to withdraw mode and then withdraw your tokens. (We love your money too much so please don't withdraw all).",
      image: '/images/withdraw.png'
    },
    {
      title: "Need Help?",
      description: "Access our Help Center or join our community channels on Telegram, and Twitter for support and updates.",
      image: '/images/help.png'
    },
  ];

  const handleNextStep = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step, close the walkthrough
      setShowWalkthrough(false);
      localStorage.setItem("hasSeenWalkthrough", "true");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipWalkthrough = () => {
    setShowWalkthrough(false);
    localStorage.setItem("hasSeenWalkthrough", "true");
  };
  return (
    <main className="bg-[#efefef] relative">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
            <Nav/>
            <main className="flex-1 p-4">
              <Dashboard />
              <Market />
              <Footer />
            </main>
          </div>
        </div>

         {/* Walkthrough Modal */}
         {showWalkthrough && (
         <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <div className="w-[720px] h-fit bg-white rounded-lg p-4 relative">
            <button className="absolute top-4 right-4 text-black" onClick={handleSkipWalkthrough}>Skip</button>
            <div className="w-full flex flex-col items-center px-4 py-3 gap-4">
              <h1 className="text-black text-[32px] font-[600] text-center font-serif">{walkthroughSteps[currentStep].title}</h1>
              <p className="text-black max-w-[85%] text-center">
                {walkthroughSteps[currentStep].description}
              </p>
              <div className="w-full h-[300px] border border-black rounded-lg">
                <Image src={walkthroughSteps[currentStep].image || ''} alt="Peer Protocol" width={500} height={500} className="w-full h-full rounded-lg" />
              </div>
            </div>
            <div className="flex justify-between mt-2 px-4">
              <button className="flex gap-2 items-center bg-black px-4 py-1 text-white rounded-md k" onClick={handlePreviousStep}>
                <ArrowLeft className="text-white h-4 w-4" />
                Previous
              </button>
              <button className="flex gap-2 items-center bg-black px-4 py-1 text-white rounded-md animate-pulse" onClick={handleNextStep}>
                {currentStep < walkthroughSteps.length - 1 ? "Next" : "Get Started"}
                <ArrowRight className="text-white h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-center">
              {walkthroughSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    index === currentStep ? "bg-black" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
         )};
    </main>
  );
}
