import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import images from "../services/images";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "../client";

const wallets = [createWallet("io.metamask")];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [toggleDrawer, setToggleDrawer] = useState(false);

  return (
    <div className="flex md:flex-row flex-col-reverse justify-between mb-8 gap-6 p-3">
      {/* Logo Section */}
      <div className="lg:flex-1 flex items-center justify-center md:justify-start py-2 pl-4 pr-2 h-13 rounded-full">
        <img
          src={images.logo}
          alt="Logo"
          className="h-10 w-auto object-contain" // Adjust the height and width here
        />
      </div>

      {/* Connect Button for larger screens */}
      <div className="hidden sm:flex flex-row justify-end items-center gap-4">
        <ConnectButton client={client} wallets={wallets} />
      </div>

      {/* Small screen navigation */}
      <div className="sm:hidden flex justify-between items-center relative">
        <img
          src={images.menu}
          alt="menu"
          className="w-8 h-8 object-contain cursor-pointer"
          onClick={() => setToggleDrawer(prev => !prev)}
        />

        <div
          className={`absolute top-14 right-0 left-0 bg-gray-800 z-10 shadow-lg py-4 transition-transform duration-700 ${
            toggleDrawer ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex justify-center mx-4">
            <ConnectButton client={client} wallets={wallets} autoConnect={{ timeout: 86400000 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
