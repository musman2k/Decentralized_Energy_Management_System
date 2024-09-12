import React, { useEffect, useState } from "react";
import FormField from "../../components/FormField";
import { toWei } from "thirdweb";
import { ethers } from "ethers";
import { contract } from "../../components/contract";

// Define the state type for the form
type FormState = {
  amount: string;
  price: string;
  biddingDeadline: string;
  energyTransTime: string;
};

const Seller: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    amount: "",
    price: "",
    biddingDeadline: "",
    energyTransTime: "",
  });

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [bidsByOffer, setBidsByOffer] = useState<{ [key: number]: any[] }>({});

  // Handle form field changes
  const handleFormFieldChange = (
    fieldName: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  // Handle registration of a participant
  const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contractInstance = new ethers.Contract(contract.address, contract.abi, signer);

      const participant = await contractInstance.participants(userAddress);

      if (!participant.isRegistered) {
        const transaction = await contractInstance.register();
        await transaction.wait();
      }
    } catch (error) {
      console.error("Error in registration:", error);
    }
  };

  // Handle creating a new energy offer
  const handleCreateOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const biddingDeadlineInSeconds = parseInt(form.biddingDeadline);
    const energyTimeInSeconds = parseInt(form.energyTransTime);

    if (energyTimeInSeconds <= biddingDeadlineInSeconds) {
      alert(
        "Energy Transaction Time must be at least one hour greater than the Bidding Deadline."
      );
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const amountInkwH = parseInt(form.amount, 10);
      const priceInWei = BigInt(toWei(form.price.toString()));
      const contractInstance = new ethers.Contract(contract.address, contract.abi, signer);

      const transaction = await contractInstance.offerEnergyCreation(
        amountInkwH,
        priceInWei,
        biddingDeadlineInSeconds,
        energyTimeInSeconds
      );

      console.log("Offer Created. Transaction Hash:", transaction.hash);
    } catch (error) {
      console.error("Error in offer creation:", error);
    }
  };

  // Fetch existing offers from the blockchain
  const fetchOffers = async () => {
    try {
      if (!window.ethereum) throw new Error("No Ethereum provider found");

      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contract.address, contract.abi, signer);
      const userAddress = await signer.getAddress();
      const offerCount = await contractInstance.offerCount();
      const activeOffers = [];
      const bidsByOfferTemp: { [key: number]: any[] } = {};

      for (let i = 0; i < offerCount; i++) {
        const offer = await contractInstance.offers(i);
        const biddingDeadlineDate = new Date(Number(offer[5]) * 1000);
        const currentTime = new Date();

        if (biddingDeadlineDate <= currentTime) {
          await handleCancelOffer(i);
          continue;
        }

        if (offer.isActive && offer[1] === userAddress && offer[4]) {
          activeOffers.push({ id: i, ...offer });

          const bids = await fetchBidsForOffer(i);
          bidsByOfferTemp[i] = bids;
        }
      }

      setOffers(activeOffers);
      setBidsByOffer(bidsByOfferTemp);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bids for a specific offer
  const fetchBidsForOffer = async (offerId: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contract.address, contract.abi, signer);

      const bids = await contractInstance.getBids(offerId);
      return bids;
    } catch (error) {
      console.error("Error fetching bids:", error);
      return [];
    }
  };

  // Handle cancelling an offer
  const handleCancelOffer = async (offerId: number) => {
    try {
      if (!window.ethereum) throw new Error("No Ethereum provider found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contract.address, contract.abi, signer);

      const transaction = await contractInstance.cancelOffer(offerId);
      console.log("Offer Cancelled. Transaction Hash:", transaction.hash);
    } catch (error) {
      console.error("Error cancelling offer:", error);
    }
  };

  // Handle accepting the highest bid for an offer
  const handleHighestBid = async (offerId: number) => {
    try {
      if (!window.ethereum) throw new Error("No Ethereum provider found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contract.address, contract.abi, signer);

      const transaction = await contractInstance.acceptHighestBid(offerId);
      console.log("Highest Bid Accepted. Transaction Hash:", transaction.hash);
    } catch (error) {
      console.error("Error accepting highest bid:", error);
    }
  };

  // Fetch offers when the component mounts
  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="flex justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="flex flex-col items-center w-full max-w-2xl p-6 space-y-8">
        {/* Register Button */}
        <button
          onClick={handleRegister}
          className="w-full py-3 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors duration-300"
        >
          Register as Participant
        </button>

        {/* Create Offer Form */}
        <div className="w-full text-center">
          <h2 className="text-4xl font-bold text-white">Create an Offer</h2>
          <p className="text-sm text-gray-400 mt-2">
            Fill out the form below to create a new energy offer.
          </p>
        </div>

        <form
          onSubmit={handleCreateOffer}
          className="w-full mt-4 flex flex-col space-y-4"
        >
          <FormField
            labelName="Energy Amount (kWh) *"
            placeholder="10 kWh"
            inputType="text"  // Change to text to remove spinners
            value={form.amount}
            handleChange={(e) => handleFormFieldChange("amount", e)}
            inputMode="numeric"  // Ensure numeric input
            pattern="[0-9]*"  // Restrict to numbers only
          />
          <FormField
            labelName="Energy Price (ETH) *"
            placeholder="0.50 ETH"
            inputType="text"  // Change to text to remove spinners
            value={form.price}
            handleChange={(e) => handleFormFieldChange("price", e)}
            inputMode="decimal"  // Allow decimal numbers
            pattern="[0-9]+([.,][0-9]+)?"  // Restrict to numbers with optional decimal
          />
          <FormField
            labelName="Offer Availability (Hours) *"
            placeholder="6 Hours"
            inputType="text"  // Change to text to remove spinners
            value={form.biddingDeadline}
            handleChange={(e) => handleFormFieldChange("biddingDeadline", e)}
            inputMode="numeric"  // Ensure numeric input
            pattern="[0-9]*"  // Restrict to numbers only
          />
          <FormField
            labelName="Energy Transaction Time (Hours) *"
            placeholder="7 Hours"
            inputType="text"  // Change to text to remove spinners
            value={form.energyTransTime}
            handleChange={(e) => handleFormFieldChange("energyTransTime", e)}
            inputMode="numeric"  // Ensure numeric input
            pattern="[0-9]*"  // Restrict to numbers only
          />
          <button
            type="submit"
            className="w-full py-3 mt-4 text-lg font-semibold bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg transition-colors duration-300"
          >
            Create Offer
          </button>
        </form>

        {/* Display Available Offers */}
        <div className="w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Available Energy Offers</h2>
          {loading ? (
            <p className="text-lg text-cyan-400">Loading offers...</p>
          ) : offers.length > 0 ? (
            <div className="space-y-4"> {/* Reduce the space between offers */}
              {offers.map((offer, index) => {
                const biddingDeadlineDate = new Date(Number(offer[5]) * 1000);
                const energyTransactionTime = new Date(Number(offer[6]) * 1000);

                return (
                  <div
                    key={index}
                    className="p-3 border border-cyan-500 rounded-lg shadow-md bg-gray-800 text-sm" // Reduced padding and font size
                  >
                    <p>
                      <strong>OfferId:</strong> {ethers.formatUnits(offer[0], 0)}
                    </p>
                    <p>
                      <strong>Seller:</strong> {offer[1]}
                    </p>
                    <p>
                      <strong>Amount:</strong> {ethers.formatUnits(offer[2], 0)} kWh
                    </p>
                    <p>
                      <strong>Price:</strong> {ethers.formatEther(offer[3])} ETH
                    </p>
                    <p>
                      <strong>Bidding Deadline:</strong> {biddingDeadlineDate.toLocaleString()}
                    </p>
                    <p>
                      <strong>Energy Transaction Time:</strong> {energyTransactionTime.toLocaleString()}
                    </p>
                    <div className="flex justify-between mt-4 space-x-4">
                      <button
                        onClick={() => handleHighestBid(offer[0])}
                        className="w-1/2 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-300"
                      >
                        Accept Bid
                      </button>
                      <button
                        onClick={() => handleCancelOffer(index)}
                        className="w-1/2 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-300"
                      >
                        Cancel Offer
                      </button>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-cyan-500"> {/* Reduced the font size */}
                        Bids:
                      </h3>
                      {bidsByOffer[offer.id]?.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {bidsByOffer[offer.id].map((bid, bidIndex) => (
                            <li key={bidIndex} className="text-xs text-gray-300"> {/* Smaller text */}
                              <p>
                                <strong>Bidder:</strong> {bid.bidder}
                              </p>
                              <p>
                                <strong>Amount:</strong> {ethers.formatEther(bid.amount)} ETH
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">No bids placed yet.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">You haven't created any offer yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Seller;
