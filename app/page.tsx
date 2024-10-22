"use client"
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
import { FaWallet, FaSearch, FaUser, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import algosdk from 'algosdk';
import { NetworkId, useWallet } from '@txnlab/use-wallet-react';
import React from "react";
import Image from 'next/image';

const peraWallet = new PeraWalletConnect();

interface KOL {
  id: number;
  name: string;
  rate: number;
  image: string;
  description: string;
  expertise: string[];
  followers: number;
}

export default function Home() {
  const {
    algodClient,
    activeAddress,
    setActiveNetwork,
    transactionSigner,
    wallets
  } = useWallet();
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnectedToPeraWallet = !!accountAddress;
  const [kols] = useState<KOL[]>([
    { id: 1, name: "Alex Blockchain", rate: 5, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmPn1N246VyYCxTbpPV6q6RLq1q3dpoez8Ru4rL345UFAs", description: "Blockchain expert and influencer", expertise: ["DeFi", "NFTs"], followers: 100000 },
    { id: 2, name: "Sophia Crypto", rate: 7, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmPn1N246VyYCxTbpPV6q6RLq1q3dpoez8Ru4rL345UFAs", description: "Cryptocurrency analyst and educator", expertise: ["Trading", "Market Analysis"], followers: 150000 },
    { id: 3, name: "Max Decentralized", rate: 6, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmPn1N246VyYCxTbpPV6q6RLq1q3dpoez8Ru4rL345UFAs", description: "Decentralized systems architect", expertise: ["Smart Contracts", "DAOs"], followers: 80000 },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    peraWallet
      .reconnectSession()
      .then((accounts: string[]) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e: Error) => console.log(e));
  }, []);

  function handleConnectWalletClick() {
    wallets[0]
      .connect()
      .then((newAccounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0].address);
        setActiveNetwork(NetworkId.TESTNET);
        wallets[0].setActiveAccount(newAccounts[0].address)
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    wallets[0].disconnect();
    setAccountAddress(null);
  }

  async function handleHire(kol: KOL) {
    if (!accountAddress || !activeAddress) {
      alert('Please connect your wallet before hiring a KOL.');
      return;
    }

    try {
      const atc = new algosdk.AtomicTransactionComposer()
      const suggestedParams = await algodClient.getTransactionParams().do()
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        suggestedParams: suggestedParams,
        from: accountAddress,
        to: "DTUA424DKCJYPHF5MLO6CL4R2BWOTH2GLOUQA257K5I7G65ENHSDJ4TTTE",
        amount: kol.rate * 1000000,
      });
      
      atc.addTransaction({ txn: transaction, signer: transactionSigner })

      const result = await atc.execute(algodClient, 2)
      console.info(`Transaction successful!`, {
        confirmedRound: result.confirmedRound,
        txIDs: result.txIDs
      })
      alert('KOL hire successful!')
    } catch (error) {
      console.error('Error during transaction:', error)
      alert('An error occurred while hiring a KOL. Please try again.')
    }
  }

  const filteredKOLs = kols.filter(kol =>
    kol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kol.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">BlockchainKOL</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search KOL..."
                className="py-2 px-4 pr-10 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center hover:bg-blue-600 transition duration-300"
              onClick={isConnectedToPeraWallet ? handleDisconnectWalletClick : handleConnectWalletClick}
            >
              <FaWallet className="mr-2" />
              {isConnectedToPeraWallet ? "Disconnect Wallet" : "Connect Pera Wallet"}
            </button>
            <FaUser className="text-2xl cursor-pointer text-gray-600" />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <h2 className="text-4xl font-semibold mb-8 text-center text-gray-700">Top Blockchain KOLs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredKOLs.map((kol) => (
            <div key={kol.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform transition duration-300 hover:scale-105">
              <Image 
                src={kol.image} 
                alt={kol.name} 
                width={300} 
                height={300} 
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-xl mb-1 text-blue-600">{kol.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Expertise: {kol.expertise.join(", ")}</p>
                <p className="text-sm text-gray-600 mb-2">Followers: {kol.followers.toLocaleString()}</p>
                <p className="text-gray-700 text-sm mb-4">{kol.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">{kol.rate} ALGO/hour</span>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300"
                    onClick={() => handleHire(kol)}
                  >
                    Sponsor Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-8 mt-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About BlockchainKOL</h3>
            <ul className="space-y-2">
              <li>Introduction</li>
              <li>Recruitment</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li>Help Center</li>
              <li>Buying Guide</li>
              <li>Payment Methods</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Partnerships</h3>
            <ul className="space-y-2">
              <li>Terms of Service</li>
              <li>Sell with BlockchainKOL</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect with Us</h3>
            <div className="flex space-x-4">
              <FaFacebook className="text-2xl" />
              <FaTwitter className="text-2xl" />
              <FaInstagram className="text-2xl" />
              <FaLinkedin className="text-2xl" />
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2024 BlockchainKOL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
