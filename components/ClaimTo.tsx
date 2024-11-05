"use client";

import { useState } from "react";
import { Button } from "@nextui-org/react";
import { ClaimTransactionResults } from "./ClaimTransactionResults";
import { CHAIN_ID } from "../utils/chains";

interface ClaimResult {
  queueId: string;
  status: "Queued" | "Sent" | "Mined ⛏️" | "error";
  transactionHash?: string;
  blockExplorerUrl?: string;
  errorMessage?: string;
  toAddress: string;
  amount: string;
  timestamp?: number;
  chainId: number;
}

export default function ClaimTo() {
  const [amount, setAmount] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ClaimResult[]>([]);
  const [toAddress, setToAddress] = useState("");

  const pollTransactionStatus = async (queueId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/claimTo?queueId=${queueId}`);
        const data = await response.json();
        
        // Update your results state with the new status
        setResults(prev => prev.map(tx => 
          tx.queueId === queueId ? { ...tx, ...data } : tx
        ));

        // If the transaction is complete, stop polling
        if (data.status === "Mined ⛏️" || data.status === "error") {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error polling status:", error);
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress || !amount) {
      alert("Please enter both address and amount.");
      return;
    }
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum < 1 || amountNum > 5) {
      alert("Amount must be between 1 and 5.");
      return;
    }
    setIsSubmitting(true);

    try {
      // Make the API call first
      const response = await fetch("/api/claimTo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toAddress, amount }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      // Now add to results with the real queueId
      setResults(prev => [...prev, {
        queueId: result.queueId,
        status: "Queued",
        toAddress,
        amount,
        timestamp: Date.now(),
        chainId: CHAIN_ID,
      }]);

      // Start polling for updates
      pollTransactionStatus(result.queueId);
    } catch (error) {
      console.error("Error:", error);
      // Update error handling as needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value);
    if (value === "" || (numValue >= 1 && numValue <= 5)) {
      setAmount(value);
    }
  };

  return (
    <div className="bg-black flex flex-col items-center p-4">
      <div className="bg-black p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Claim an ERC20 Token with thirdweb Engine!
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Enter your wallet address"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount
              </label>
              <input
                id="amount"
                type="number"
                min="1"
                max="5"
                placeholder="1"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={amount}
                onChange={handleAmountChange}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !toAddress}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Claim Tokens"}
          </Button>
        </form>
        <div className="mt-8">
          <ClaimTransactionResults results={results} />
          {/* {results.length > 0 && (
            <Button
              onClick={() => setResults([])}
              color="secondary"
              className="mt-4 w-full"
            >
              Clear Results
            </Button>
          )} */}
        </div>
      </div>
    </div>
  );
}