import Image from "next/image";
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="bg-black w-[30%] xl:w-[20%] h-screen rounded-r-[2.5rem] py-8 hidden lg:flex flex-col sticky top-0">
      <Image
        className="mx-[30%]"
        src="/images/LogoWhite.svg"
        width={50}
        height={20}
        alt="Logo"
      />
      <div className="mt-14 lg:px-4 xl:px-4 flex-1 items-center justify-center flex flex-col">
        <div className="flex flex-col gap-10 w-full flex-grow">
          <Link href='/app' className="flex gap-3 hover:border-2 delay-150 duration-200 ease-out hover:border-white border  border-transparent rounded-lg  py-4 px-10 items-center cursor-pointer">
            <Image
              src="/images/LogoWhite.svg"
              width={30}
              height={10}
              alt="Market"
            />
            <p>Market</p>
          </Link>
          <Link href="">
                <li className="flex gap-3 hover:border-2 delay-150 duration-200 ease-out hover:border-white border  border-transparent rounded-lg  py-4 px-10 items-center cursor-pointer">
                  <Image
                    src="/images/drop-of-liquid.svg"
                    height={30}
                    width={30}
                    alt="quest icon"
                    className=""
                  />
                  Liquidity
                </li>
              </Link>

              <Link href="/profile">
                <li className="flex gap-3 hover:border-2 delay-150 duration-200 ease-out hover:border-white border  border-transparent rounded-lg  py-4 px-10 items-center cursor-pointer">
                  <Image
                    src="/images/reverse-arrow.svg"
                    height={30}
                    width={30}
                    alt="quest icon"
                    className=""
                  />
                  Swap
                </li>
              </Link>
              <Link href="/app/profile">
                <li className="flex gap-3 hover:border-2 delay-150 duration-200 ease-out hover:border-white border  border-transparent rounded-lg  py-4 px-10 items-center cursor-pointer">
                  <Image
                    src="/images/dashboard.svg"
                    height={30}
                    width={30}
                    alt="quest icon"
                    className=""
                  />
                  Porfolio
                </li>
              </Link>

              <Link href="/profile">
                <li className="flex gap-3 hover:border-2 delay-150 duration-200 ease-out hover:border-white border  border-transparent rounded-lg  py-4 px-10 items-center cursor-pointer">
                  <Image
                    src="/images/asset-allocation.svg"
                    height={30}
                    width={30}
                    alt="quest icon"
                    className=""
                  />
                  Asset manager
                </li>
              </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;