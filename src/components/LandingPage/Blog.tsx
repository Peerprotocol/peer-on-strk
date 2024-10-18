"use client";
import { DarkModeContext } from "./DarkMode";
import React, { useContext } from "react";
import Image from "next/image";

interface BlogPostProps {
  title: string;
  summary: string;
}

const BlogPost: React.FC<BlogPostProps> = ({ title, summary }) => {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-black mb-6 md:mb-0">
      <Image
        src="/images/Deon.png"
        alt="Card image"
        width={30}
        height={4}
        className="w-full"
      />
      <div className="px-6 py-4">
        <div className="font-bold text-xl text-black mb-2">{title}</div>
        <p className={`${isDarkMode ? "text-white" : "text-gray-700 text-left"}`}>
          {summary}
        </p>
      </div>
      <div className="flex lg:justify-center justify-start px-8 my-4">
        <button className="bg-black text-white py-2 px-4 rounded border border-transparent hover:bg-white hover:text-black hover:border-black">
          See More
        </button>
      </div>
    </div>
  );
};

export default BlogPost;
