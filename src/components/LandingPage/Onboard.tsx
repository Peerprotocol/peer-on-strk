import { LinkIcon } from "lucide-react";
import Link from "next/link";

const Onboard = () => {
  return (
    <div className="lg:h-screen bg-black text-white w-full flex flex-col justify-center h-fit py-8 sm:p-4 sm:pb-6">
      <div className="">
        <div className="flex flex-col">
          <p className="lg:text-[10rem] text-center font-bold lg:text-6xl text-4xl">GET</p>
          <p className="lg:text-[10rem] text-center font-bold lg:text-6xl text-4xl">ONBOARD</p>
        </div>

        <div className="text-center lg:py-16 w-full">
          <p className="lg:text-[2rem] text-lg sm:text-md">Join the waitlist</p>
          <p className="mx-auto text-center py-2 md:w-[80%] font-light sm:text-xs">
            Sign up and follow for updates about Mainnet launch, integrations,
            product launches and the future of Peer Protocol.
          </p>
        </div>

        <div className="mx-auto relative rounded-full w-fit">
          <Link href="/Waitlist">
          <button className=" flex gap-2 items-center text-[1rem] px-6 py-4 rounded-full bg-white text-black">
            Join Waitlist
            <LinkIcon size="24" />
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Onboard;
