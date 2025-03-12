"use client";
import { DarkModeContext } from "./DarkMode";
import React, { useContext } from "react";
import Image from "next/image";
import Link from "next/link";

interface BlogPostProps {
  title: string;
  summary: string;
}

const BlogPost: React.FC<BlogPostProps> = ({ title, summary }) => {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <div
      className={`rounded-lg overflow-hidden shadow-lg border border-black bg-white text-black h-full flex flex-col m-8 md:m-0 ${isDarkMode && 'border-white'}`}
    >
      <div className="w-full h-48 relative">
        <Image
          src="/images/Deon.png"
          alt="Card image"
          fill
          className="object-cover"
        />
      </div>
      <div className="px-6 py-4 flex-grow flex flex-col h-64">
        <div className='font-bold text-xl mb-6 md:mb-11 h-14 text-black'>
          {title}
        </div>
        <div className="flex-grow overflow-hidden">
          <p className='text-black text-left line-clamp-5'>
            {summary}
          </p>
        </div>
      </div>
      <div className="px-6 pb-6 pt-2">
        <Link href="/blog" className="block w-full">
          <button
            className='py-2 px-4 rounded border border-transparent bg-black text-white hover:bg-white hover:text-black hover:border-black w-full'
          >
            See More
          </button>
        </Link>
      </div>
    </div>
  );
};

export default BlogPost;