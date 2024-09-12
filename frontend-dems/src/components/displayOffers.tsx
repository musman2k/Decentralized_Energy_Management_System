import { useActiveAccount, useReadContract } from "thirdweb/react";
import { defineChain, prepareContractCall, resolveMethod, getContract  } from "thirdweb"
import { ConnectButton } from "thirdweb/react";
import { Address, getAddress } from "thirdweb";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { useState } from "react";
import { ethers  } from "ethers";
import { contract } from "./contract";




const DisplayOffers: React.FC = () => {
    
    const {data: count} = useReadContract({
        contract: contract,
        method: "offerCount"
    })
    
      const account = useActiveAccount();

    return(
        <div>
            <h1>OfferCreate: </h1>
            <h2>{count?.toString()}</h2>
            <h3>{account?.address}</h3> 
        </div>
    )
};

export default DisplayOffers;