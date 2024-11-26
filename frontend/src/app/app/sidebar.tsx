import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();
  const showQuestLinks = pathname.startsWith("/app/quests");

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

          <Link href="/app/quests">
                <li className="flex gap-2">
                  <Image
                    src="/icons/quests.svg"
                    height={30}
                    width={30}
                    alt="Notification icon"
                    className=""
                  />
                  Quests
                </li>
              </Link>

          {showQuestLinks && (
            <>
              <Link href='/app/quests/referral' className="flex gap-3 items-center cursor-pointer">
                <Image
                  src="/icons/referral.svg"
                  width={30}
                  height={10}
                  alt="Referral"
                />
                <p>Referral</p>
              </Link>
              <Link href='/app/quests/leaderboard' className="flex gap-3 items-center cursor-pointer">
                <Image
                  src="/icons/leaderboard.svg"
                  width={30}
                  height={10}
                  alt="Leaderboard"
                />
                <p>Leaderboard</p>
              </Link>
              <Link href='/app/quests/socials' className="flex gap-3 items-center cursor-pointer">
                <Image
                  src="/icons/social.svg"
                  width={30}
                  height={10}
                  alt="Social Quests"
                />
                <p>Social Quests</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;