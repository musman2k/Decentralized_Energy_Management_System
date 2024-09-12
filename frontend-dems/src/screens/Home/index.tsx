import React, { useState } from "react";
import { ethers } from "ethers";
import { contract } from "../../components/contract";
import './styles.css';

const WithdrawFunds: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState<string>("");

  const handleWithdrawFunds = async () => {
    try {
      if (!window.ethereum) throw new Error("No Ethereum provider found");

      setLoading(true);
      setWithdrawMessage("");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contract.address, contract.abi, signer);

      const transaction = await contractInstance.withdrawFunds();
      await transaction.wait();

      setWithdrawMessage("Funds withdrawn successfully!");
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      setWithdrawMessage("Failed to withdraw funds. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="content">
        <div className="about-section">
          <div className="about-card">
            <h2>DEMS</h2>
            <p className="tagline">Empowering the Future of Energy</p>
            <p>
              Join us on a journey to a sustainable future. Our blockchain-based platform
              facilitates transparent and secure peer-to-peer energy trading, focusing on
              decentralization, sustainability, and efficiency to revolutionize the energy sector.
            </p>
          </div>
        </div>

        <div className="video-section">
          <video className="bg-video" autoPlay muted loop>
            <source src="/src/Assets/bg-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="withdraw-section">
          <button
            onClick={handleWithdrawFunds}
            className="withdraw-button"
            disabled={loading}
          >
            {loading ? "Withdrawing..." : "Withdraw Funds"}
          </button>
          {withdrawMessage && <p className="message">{withdrawMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default WithdrawFunds;
