import Image from "next/image";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="p-6">
        <Link href="/" aria-label="Home">
          <Image
            src="/images/logoblack.svg"
            alt="Peerprotocol Logo"
            width={40}
            height={40}
            className="text-black"
          />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative pb-[20vh] md:pb-[30vh]">
        <div className="max-w-2xl mx-auto text-center space-y-6 mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-6xl font-bold tracking-tight text-black">
            Welcome to
            <br />
            Peerprotocol&apos;s Quests
          </h1>
          <p className="text-xs sm:text-sm md:text-xl text-black/80 font-light max-w-xl mx-auto">
            Journey through each Period and succeed by completing the Quests,
            stack your XPs - and wait for magic.
          </p>
        </div>

        <button className="inline-flex items-center justify-center rounded-full border-2 border-black px-8 py-3 text-base font-medium text-black hover:bg-black/70 hover:text-white transition-colors">
          Login with
          <Image
            src="/images/TwitterXsvg.svg"
            alt="X (formerly Twitter)"
            width={20}
            height={20}
            className="ml-2"
          />
        </button>
      </main>

      <div className="w-full absolute bottom-0 left-0 right-0 px-4 md:px-7">
        <Image
          src="/images/questHero.svg"
          alt="Decorative curved lines representing Peerprotocol's Quests journey"
          width={1920}
          height={500}
          className="w-full h-auto md:h-[40vh]"
          priority
        />
      </div>
    </div>
  );
}
