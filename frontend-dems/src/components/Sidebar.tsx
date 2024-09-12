import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import images from "../services/images";

type MenuItem = {
  name: string;
  icon: string;
  route: string;
};

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggle = () => setIsOpen(!isOpen);

  const menuItem: MenuItem[] = [
    { name: "Home", icon: images.Home, route: "/" },
    { name: "Dashboard", icon: images.dashboard, route: "/dashboard" },
    { name: "Seller", icon: images.Sellerspark, route: "/seller" },
    { name: "Buyer", icon: images.Buyerp2p, route: "/buyer" }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-10 bg-gray-800 transition-width duration-300 ${isOpen ? "w-64" : "w-20"}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          <h1 className={`text-white transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
            <img src={images.dems1} alt="logo icon" className="h-8 w-8" />
          </h1>
          <FaBars className="text-white cursor-pointer" onClick={toggle} />
        </div>
        <div className="flex flex-col mt-4">
          {menuItem.map((item) => (
            <NavLink 
              to={item.route} 
              key={item.name} 
              className="flex items-center p-4 text-white hover:bg-gray-700 transition-colors"
            >
              <img src={item.icon} alt={`${item.name} Icon`} className="h-6 w-6" />
              <span className={`ml-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
