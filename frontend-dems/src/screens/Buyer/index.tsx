import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toWei } from "thirdweb";
import FormField from "../../components/FormField";
import { contract } from "../../components/contract";
import { useActiveAccount } from "thirdweb/react";

const Buyer: React.FC = () => {
  // State hooks to manage offers, bid amounts, loading state, error messages, and user bids
  const [offers, setOffers] = useState<any[]>([]);
  const [bidAmounts, setBidAmounts] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Stores error messages
  const account = useActiveAccount();
  const [userBids, setUserBids] = useState<{ [offerId: number]: any[] }>({});

  // Fetches all active offers from the blockchain
  const fetchOffers = async () => {
    try {
      // Ensure there's an Ethereum provider available
      if (!window.ethereum) throw new Error("No Ethereum provider found");

      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        contract.address,
        contract.abi,
        signer
      );

      // Retrieve the number of offers and then fetch each offer's details
      const offerCount = await contractInstance.offerCount();
      const activeOffers = [];

      for (let i = 0; i < offerCount; i++) {
        const offer = await contractInstance.offers(i);
        activeOffers.push({ id: i, ...offer });
      }

      setOffers(activeOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetches the current user's bids for the active offers
  const fetchUserBids = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        contract.address,
        contract.abi,
        signer
      );
      const userAddress = await signer.getAddress();
      const activeUserBids: { [offerId: number]: any[] } = {};

      // For each offer, filter out the bids made by the current user that are still active
      for (let i = 0; i < offers.length; i++) {
        const offerId = offers[i].id;
        const bidsForOffer = await contractInstance.getBids(offerId);
        activeUserBids[offerId] = bidsForOffer.filter(
          (bid: any) => bid.bidder === userAddress && bid.isActive
        );
      }

      setUserBids(activeUserBids);
    } catch (error) {
      console.error("Error fetching user bids:", error);
    }
  };

  // Handles the logic for placing a bid on an offer
  const handleBid = async (offerId: number) => {
    try {
      if (!window.ethereum) throw new Error("No Ethereum provider found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        contract.address,
        contract.abi,
        signer
      );

      const bidAmountInWei = BigInt(toWei(bidAmounts[offerId] || "0"));

      const transaction = await contractInstance.bidToOffer(
        offerId,
        bidAmountInWei,
        { value: bidAmountInWei }
      );
      console.log("Bid placed. Transaction Hash:", transaction.hash);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error("Error placing bid:", error);

      // Handle specific errors like insufficient funds
      if (error.message.toLowerCase().includes("insufficient funds")) {
        setError("Insufficient funds to place the bid.");
      } else {
        setError("An error occurred while placing the bid.");
      }
    }
  };

  // Updates the state when the bid amount is changed by the user
  const handleBidAmountChange = (offerId: number, value: string) => {
    setBidAmounts((prevState) => ({
      ...prevState,
      [offerId]: value,
    }));
  };

  // Handles the logic for withdrawing a user's bid
  const handleWithdrawBid = async (offerId: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        contract.address,
        contract.abi,
        signer
      );

      const transaction = await contractInstance.withdrawBid(offerId);
      console.log("Bid withdrawn. Transaction Hash:", transaction.hash);

      // Refresh the user's bids after withdrawal
      fetchUserBids();
    } catch (error) {
      console.error("Error withdrawing bid:", error);
    }
  };

  // Fetch offers and user bids when the component mounts
  useEffect(() => {
    fetchOffers().then(fetchUserBids);
  }, []);

  return (
    <div className="flex justify-center bg-gray-900 min-h-screen py-10">
      <div className="flex flex-col items-center w-full max-w-4xl p-6 space-y-6">
        <h2 className="text-3xl font-extrabold text-white tracking-wide mb-4">
          Available Energy Offers
        </h2>
        {loading ? (
          <p className="text-white">Loading offers...</p>
        ) : offers.length > 0 ? (
          <>
            {error && (
              // Display any error message to the user
              <div className="w-full p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offers.map((offer, index) => {
                const deadlineDate = new Date(Number(offer[5]) * 1000);
                const energyTransTime = new Date(Number(offer[6]) * 1000);

                return (
                  <div
                    key={index}
                    className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
                  >
                    <p className="text-sm text-gray-400">
                      <strong>OfferId:</strong> {ethers.formatUnits(offer[0], 0)}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Seller:</strong> {offer[1]}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Amount:</strong> {ethers.formatUnits(offer[2], 0)} kWh
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Price:</strong> {ethers.formatEther(offer[3])} ETH
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Bidding Deadline:</strong>{" "}
                      {deadlineDate.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Energy Transaction Time:</strong>{" "}
                      {energyTransTime.toLocaleString()} hours
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Status:</strong> {offer[4] ? "Active" : "Inactive"}
                    </p>
                    {offer[4] && (
                      <>
                        <FormField
                          labelName="Bid Amount (ETH)"
                          placeholder="0.1 ETH"
                          inputType="number"
                          value={bidAmounts[offer[0]] || ""}
                          handleChange={(e) =>
                            handleBidAmountChange(offer.id, e.target.value)
                          }
                          inputClass="bg-gray-700 text-white mt-4 text-sm"
                        />
                        <button
                          onClick={() => handleBid(parseInt(offer[0]))}
                          className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Place Bid
                        </button>
                      </>
                    )}
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-400 text-sm">
                        Your Bids:
                      </h3>
                      {userBids[offer.id]?.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {userBids[offer.id].map((bid, bidIndex) => (
                            <li
                              key={bidIndex}
                              className="flex justify-between items-center bg-gray-700 p-2 rounded-md"
                            >
                              <p className="text-xs text-gray-300">
                                <strong>Bid Amount:</strong>{" "}
                                {ethers.formatEther(bid[1])} ETH
                              </p>
                              <button
                                onClick={() => handleWithdrawBid(offer.id)}
                                className="text-red-500 hover:text-red-700 transition-colors text-xs"
                              >
                                Withdraw
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400">
                          No bids placed yet.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-white">No active offers available.</p>
        )}
      </div>
    </div>
  );
};

export default Buyer;
