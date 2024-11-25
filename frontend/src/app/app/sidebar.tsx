import Image from "next/image";
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="bg-black w-[15%] h-screen rounded-r-[2.5rem] py-8 hidden text-white lg:flex flex-col sticky top-0">
      <Image
        className="mx-[30%]"
        src="/images/LogoWhite.svg"
        width={50}
        height={20}
        alt="Logo"
      />
      <div className="mt-14 px-10 flex-1 flex flex-col">
        <div className="flex flex-col gap-14 flex-grow">
          <Link href='/app' className="flex gap-3 items-center cursor-pointer">
            <Image
              src="/images/LogoWhite.svg"
              width={30}
              height={10}
              alt="Market"
            />
            <p>Market</p>
          </Link>
          <Link href='/app/profile' className="flex gap-3 items-center cursor-pointer">
            <Image
              src="/images/portfolio.svg"
              width={30}
              height={10}
              alt="Liquidity"
            />
            <p>Portfolio</p>
          </Link>
          <Link href='' type="disabled" className="flex gap-3 items-center cursor-pointer">
            <Image
              src="/images/institution.svg"
              width={30}
              height={10}
              alt="Business"
            />
            <p>B2B</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;