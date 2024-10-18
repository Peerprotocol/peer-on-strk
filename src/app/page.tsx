"use client";
import React, { useState, useContext, useEffect } from "react";
import Navbar from "../components/LandingPage/Navbar";
import HeroPage from "../components/LandingPage/HeroSection";
import Features from "../components/LandingPage/Features";
import About from "../components/LandingPage/About";
import Team from "../components/LandingPage/TeamPage";
import Onboard from "../components/LandingPage/Onboard";
import BlogPost from "../components/LandingPage/Blog";
import Footer from "../components/LandingPage/Footer";
import { DarkModeContext } from "../components/LandingPage/DarkMode";

// Sample blog data
const blogPosts = [
  {
    title: "Building Trustless Lending: The Future of Peer Protocol",
    summary: "Peer Protocol is redefining lending by offering a trustless, decentralized system. Explore how it paves the way for a new era of decentralized finance.",
  },
  {
    title: "How Peer Protocol Revolutionizes DeFi Lending",
    summary: "By enabling peer-to-peer lending, Peer Protocol connects lenders and borrowers directly, offering greater financial freedom with competitive rates.",
  },
  {
    title: "Empowering Users through Peer-to-Peer Lending",
    summary: "Peer Protocol puts the power in the hands of users, offering customizable loan agreements with decentralized governance and smart contract automation.",
  },
  {
    title: "Decentralized Lending: The Core of Peer Protocol",
    summary: "Explore how Peer Protocol leverages blockchain for secure, transparent transactions, creating a trustless environment for decentralized lending.",
  },
];

function Landing() {
  const { isDarkMode } = useContext(DarkModeContext);

  useEffect(() => {}, [isDarkMode]);
  
  return (
    <div className={`${isDarkMode ? "bg-[#0d101711]" : "bg-[#F5F5F5]"} w-full`}>
      <section
        className={`${
          isDarkMode
            ? "bg-black text-white lg:px-8"
            : "bg-white text-black lg:px-8"
        } lg:px-8 px-3`}
      >
        <Navbar />
        <HeroPage />
        <Features />
        <About />
        <Team />
      </section>
      <Onboard />
      <div
        className={`${
          isDarkMode ? "bg-[#0d101711]" : "bg-[#F5F5F5]"
        } xl:flex md:grid grid-cols-2 md:px-9 md:gap-6 my-32`}
      >
        {blogPosts.map((post, index) => (
          <BlogPost key={index} title={post.title} summary={post.summary} />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Landing;
