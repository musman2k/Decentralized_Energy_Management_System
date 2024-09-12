import { defineChain, getContract } from "thirdweb";
import { contractABI } from "./contractABI";

const contractAddress = "0xa81651553b874e1e31d617460a22Fc1F298aCBE4";

export const contract = getContract({
    client: import.meta.env.VITE_TEMPLATE_CLIENT_ID,
  
    chain: defineChain(11155111),
    address: contractAddress,
    abi: contractABI,   
});