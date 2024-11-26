import Image from "next/image";


interface LeaderboardItem {
  avatar: string;
  name: string;
  rank?: string;
  points: string;
  badge?: string;
}

const Dashboard: React.FC = () => {
  const headerData = {
    imageSrc: "/images/cup.svg",
    title: "Leaderboard",
  };

  const statsData = {
    label: "Total participants",
    value: "20,465,485 players",
  };

  const leaderboardData: LeaderboardItem[] = [
    {
      avatar: "/images/badge.svg",
      name: "Duchekelvin",
      rank: "#20,035",
      points: "2,564,466 xps",
      badge: "",
    },
    {
      avatar: "/images/badge.svg",
      name: "Duchekelvin",
      rank: "",
      points: "2,564,466 xps",
      badge: "/images/goldicon.svg",
    },
    {
      avatar: "/images/badge.svg",
      name: "Duchekelvin",
      rank: "",
      points: "2,564,466 xps",
      badge: "/images/silver.svg",
    },
    {
      avatar: "/images/badge.svg",
      name: "Duchekelvin",
      rank: "",
      points: "2,564,466 xps",
      badge: "/images/bronze.svg",
    },
    {
      avatar: "/images/badge.svg",
      name: "Duchekelvin",
      rank: "#4",
      points: "2,564,466 xps",
      badge: "",
    },
  ];

  return (
    <div>
      <div className="flex flex-col items-center mb-4">
        <Image
          src={headerData.imageSrc}
          alt={headerData.title}
          width={80}
          height={80}
          className="rounded-full"
        />
        <p className="text-black font-bold text-lg pt-2">{headerData.title}</p>
      </div>

      {/* Stats Section */}
      <div className="w-full border rounded-xl p-4 flex justify-between items-center mb-10">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-start">
            <p className="text-black font-['Raleway']">{statsData.label}</p>
          </div>
        </div>
        <p className="text-black font-['Raleway']">{statsData.value}</p>
      </div>

      {/* Highlighted Leaderboard Item */}
      <div className="w-full border-t-1 border-b-1 p-4 flex justify-between my-10 border rounded-xl items-center bg-white">
        <div className="flex items-center justify-center gap-4">
          <div className="bg-[#F5F5F5] p-2 rounded-lg">
            <Image src="/images/badge.svg" alt="Logo" width={30} height={30} />
          </div>
          <div className="flex flex-col items-start">
            <p className="text-black font-['Raleway']">Duchekelvin</p>
            <p className="text-[#000000B2] font-['Raleway']">#20,035</p>
          </div>
        </div>
        <p className="text-black font-['Raleway']">2,564,466 xps</p>
      </div>

      {/* Leaderboard Items */}
      <div className="border rounded-xl">
        {leaderboardData.map((item, index) => (
          <div
            key={index}
            className={`w-full  border-b-2 p-4 flex justify-between items-center ${
              index === leaderboardData.length - 1 ? "border-b-0" : ""
            }`}
          >
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white p-2 rounded-lg">
                <Image src={item.avatar} alt={`${item.name}'s badge`} width={30} height={30} />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-black font-['Raleway']">{item.name}</p>
                {item.rank ? (
                  <p className="text-[#000000B2] font-['Raleway']">{item.rank}</p>
                ) : (
                  item.badge && <Image src={item.badge} alt="Badge" width={15} height={15} />
                )}
              </div>
            </div>
            <p className="text-black font-['Raleway']">{item.points}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;




