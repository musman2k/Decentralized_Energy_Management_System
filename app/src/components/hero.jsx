import Image from 'next/image'
import React, { useState } from 'react';

export default function Hero() {
    const [walletAddress, setWalletAddress] = useState('');
    const [energyPoints, setEnergyPoints] = useState('');
    const [displayValues, setDisplayValues] = useState(false);

    const handleSubmit = (e) => {
    e.preventDefault();
    // Display values below the button
    setDisplayValues(true);
    };
    
    return(
        <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-md shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-600">
            Wallet Address
          </label>
          <input
            type="text"
            id="walletAddress"
            className="mt-1 p-2 w-full border rounded-md"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="energyPoints" className="block text-sm font-medium text-gray-600">
            Energy Points
          </label>
          <input
            type="text"
            id="energyPoints"
            className="mt-1 p-2 w-full border rounded-md"
            value={energyPoints}
            onChange={(e) => setEnergyPoints(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-black p-2 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>

      {displayValues && (
        <div className="mt-4">
          <p className="text-gray-700">
            Wallet Address: {walletAddress}
          </p>
          <p className="text-gray-700">
            Energy Points: {energyPoints}
          </p>
        </div>
      )}
    </div>
    )
}