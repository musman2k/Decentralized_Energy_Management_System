import { useState } from "react"
import { ConnectWallet } from "@thirdweb-dev/react";
// import demsLogo from '../public/icons/demsLogo.svg'

import Image from 'next/image'
import Link from 'next/link';

export default function Header() {

    return (
        <>
            
            <header className="bg-background py-2">
                <nav className="px-4 lg:px-6 ">
                    <div className="grid grid-cols-5 justify-between items-center mx-auto max-w-screen-xl py-2.5 border-b border-white ">
                        <a href="https://www.DEMS.com" className="flex items-center">
                            {/* <Image
                                priority
                                src={demsLogo}
                                width={100}
                                height={50}
                                alt="DEMS"
                            /> */}
                        </a>
                        <div className="justify-between items-center w-full font-light font-clash uppercase col-span-3 text-lg" id="mobile-menu-2">
                            <ul className="flex w-full font-medium justify-center space-x-4 ">
                                <li>
                                    <a href="#" className="block py-2 pr-4 pl-3 text-white tracking-wide" aria-current="page">Home</a>
                                </li>
                                <li>
                                    <a href="#" className="block py-2 pr-4 pl-3 text-white tracking-wide" aria-current="page">Services</a>
                                </li>
                                <li>
                                    <a href="#" className="block py-2 pr-4 pl-3 text-white tracking-wide" aria-current="page">Projects</a>
                                </li>
                                <li>
                                    <a href="#" className="block py-2 pr-4 pl-3 text-white tracking-wide" aria-current="page">Contact Us</a>
                                </li>
                                
                            </ul>
                        </div>
                        <div className="flex justify-end items-center lg:order-2">
                            {/* <Link href="#" className="text-background bg-white hover:text-white hover:bg-background hover:ring-primary hover:ring-2 transition-all font-clash uppercase font-medium rounded-full text-md px-4 lg:px-1 py-2 lg:py-1 mr-2 flex  ">     */}
                                <span className="px-4 align-middle  text-center">
                                     <ConnectWallet
              dropdownPosition={{
                side: "bottom",
                align: "center",
              }}
            />
            </span>
                                {/* <Image priority src={}  alt="DEMS" /> */}
                            {/* </Link> */}
                        </div>
                    </div>
                </nav>
            </header>
        </>
    )
}