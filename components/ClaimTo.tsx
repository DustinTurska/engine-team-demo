"use client";

import { useState } from "react";
import { Button } from "@nextui-org/react";
import { ClaimTransactionResults } from "./ClaimTransactionResults";

interface ClaimResult {
  queueId: string;
  status: "Queued" | "Sent" | "Mined ⛏️" | "error";
  transactionHash?: string;
  blockExplorerUrl?: string;
  errorMessage: "Error" | undefined;
  toAddress: string;
  amount: string;
  timestamp?: number;
  chainId: number;
  network: 'Ethereum' | 'Base Sep' | 'OP Sep';
}

export default function ClaimTo() {
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
    if (!toAddress) {
      alert("Please enter an address.");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/claimTo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toAddress, amount: "100" }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      const timestamp = Date.now();
      setResults(prev => [...prev, 
        {
          ...result.opsep,
          timestamp,
          network: 'OP Sep'
        },
        {
          ...result.basesep,
          timestamp,
          network: 'Base Sep'
        }
      ]);

      pollTransactionStatus(result.opsep.queueId);
      pollTransactionStatus(result.basesep.queueId);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black flex flex-col items-center p-4">
      <div className="bg-black p-8 rounded-lg shadow-md w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Enter your wallet address"
                className="block w-full text-sm text-white border border-gray-700 rounded-lg p-2.5 bg-black focus:outline-none focus:ring-1 focus:ring-white focus:border-transparent placeholder-gray-500 selection:bg-white selection:text-black autofill:bg-black"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
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
        </div>
      </div>
    </div>
  );
}