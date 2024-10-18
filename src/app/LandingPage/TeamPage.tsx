import Image from "next/image";
import React, { useContext, useEffect } from "react";
import { DarkModeContext } from "./DarkMode";

// types.ts
interface TeamMember {
  name: string;
  role: string;
  image: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    telegram?: string;
  };
}

// data/teamMembers.ts
export const teamMembers: TeamMember[] = [
  {
    name: "Emmanuel Daniel",
    role: "Co-founder & CEO",
    image: "/images/Deon.png"
  },
  {
    name: "Kelvin Duche",
    role: "Co-founder & Product Designer",
    image: "/images/kev.svg"
  },
  {
    name: "Isaac Onyemaechi",
    role: "Co-founder & CTO",
    image: "/images/Izzy.png"
  },
  {
    name: "Steven Okosieme",
    role: "Product Manager",
    image: "/images/Stephen.png"
  }
];

// components/SocialLinks.tsx
const SocialLinks = () => (
  <div className="flex">
    <Image
      src="./images/Linkedinsvg.svg"
      alt="LinkedIn"
      width={20}
      height={40}
    />
    <Image
      src="./images/TwitterXsvg.svg"
      alt="Twitter"
      width={20}
      height={40}
    />
    <Image
      src="./images/Telegramsvg.svg"
      alt="Telegram"
      width={20}
      height={40}
    />
  </div>
);

// components/TeamMemberCard.tsx
interface TeamMemberCardProps {
  member: TeamMember;
  isDarkMode: boolean;
}

const TeamMemberCard = ({ member, isDarkMode }: TeamMemberCardProps) => (
  <div className="cursor-pointer lg:m-0 my-10">
    <Image 
      src={member.image} 
      alt={`${member.name}'s photo`} 
      width={380} 
      height={40} 
    />
    <div>
      <p className={`text-2xl font-semibold py-1 ${
        isDarkMode ? "text-white" : "text-black"
      }`}>
        {member.name}
      </p>
      <div className="flex justify-between">
        <p className="text-gray-500 font-semibold text-sm">
          {member.role}
        </p>
        <SocialLinks />
      </div>
    </div>
  </div>
);

// components/TeamHeader.tsx
interface TeamHeaderProps {
  isDarkMode: boolean;
}

const TeamHeader = ({ isDarkMode }: TeamHeaderProps) => (
  <div className="mb-8">
    <h1 className={`text-4xl font-bold font-raleway ${
      isDarkMode ? "text-white" : "text-black"
    }`}>
      OUR TEAM
    </h1>
  </div>
);

// components/TeamGrid.tsx
interface TeamGridProps {
  isDarkMode: boolean;
}

const TeamGrid = ({ isDarkMode }: TeamGridProps) => (
  <div className="lg:grid lg:grid-cols-3 gap-8 md:grid grid-cols-2 block">
    {teamMembers.map((member, index) => (
      <TeamMemberCard
        key={index}
        member={member}
        isDarkMode={isDarkMode}
      />
    ))}
  </div>
);

// Team.tsx (main component)

const Team = () => {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <div id="Team" className="py-32">
      <div className="w-fit gap-16 mx-auto md:grid-cols-2">
        <TeamHeader isDarkMode={isDarkMode} />
        <TeamGrid isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default Team;