import Image from "next/image";

const Footer = () => {
  return (
    <div className="bg-black text-white py-16 px-8 xl:w-[100%]">
      <div className="container mx-auto flex gap-8 flex-wrap justify-between">
        <div className="flex gap-6 items-center mb-8 w-full lg:w-auto">
          <Image src="/images/logo.svg" alt="Logo" width={50} height={50} />
          <div className="text-gray-400 text-sm">
            <p>Copyright @PeerProtocol</p>
            <p>All rights reserved</p>
          </div>
        </div>

        <div className="hidden w-full lg:w-auto lg:flex flex-wrap gap-24 justify-between mb-8">
          <div className="mb-8 lg:mb-0">
            <h5 className="text-white font-bold mb-4">Company</h5>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div className="mb-8 lg:mb-0">
            <h5 className="text-white font-bold mb-4">Support</h5>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Safety Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>

          <div className="mb-8 lg:mb-0">
            <h5 className="text-white font-bold mb-4">Legal</h5>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Cookies Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Law Enforcement
                </a>
              </li>
            </ul>
          </div>

          <div className="mb-8 lg:mb-0">
            <h5 className="text-white font-bold mb-4">Contact</h5>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Sponsorships
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
