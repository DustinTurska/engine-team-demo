"use client";

import React, { useState } from "react";
import { format } from 'timeago.js';

interface ClaimTransactionResults {
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

interface ClaimTransactionResultsProps {
  results: ClaimTransactionResults[];
}

export function ClaimTransactionResults({ results }: ClaimTransactionResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);
  const itemsPerPage = 2;

  const dummyTransaction1: ClaimTransactionResults = {
    queueId: "0x1234567890abcdef",
    status: "Mined ⛏️",
    transactionHash: "0xabcdef1234567890",
    blockExplorerUrl: "https://etherscan.io/tx/0xabcdef1234567890",
    toAddress: "0x1234567890abcdef",
    amount: "1.0",
    timestamp: Date.now() - 15 * 60 * 1000,
    chainId: 1,
    network: 'Ethereum',
    errorMessage: undefined
  };

  const dummyTransaction2: ClaimTransactionResults = {
    queueId: "0x9876543210fedcba",
    status: "Mined ⛏️",
    transactionHash: "0x1234567890abcdef",
    blockExplorerUrl: "https://etherscan.io/tx/0x1234567890abcdef",
    toAddress: "0xabcdef1234567890",
    amount: "0.5",
    timestamp: Date.now() - 30 * 60 * 1000,
    chainId: 1,
    network: 'Base Sep',
    errorMessage: undefined
  };

  const sortedResults = [...results].reverse();
  const sortedResultsWithDummy = [...sortedResults, dummyTransaction1, dummyTransaction2];
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedResultsWithDummy.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedResultsWithDummy.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const getDisplayStatus = (result: ClaimTransactionResults) => {
    if (result.status === "Mined ⛏️" && !result.transactionHash) {
      return "Pending";
    }
    return result.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mined ⛏️":
        return "bg-green-500/20 text-green-400";
      case "Queued":
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-red-500/20 text-red-400";
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtStart = target.scrollLeft === 0;
    const isAtEnd = target.scrollLeft + target.clientWidth >= target.scrollWidth - 1; // -1 for rounding errors
    
    setShowLeftGradient(!isAtStart);
    setShowRightGradient(!isAtEnd);
  };

  return (
    <div className="mt-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold text-neutral-200">
          Transaction Results
        </h2>
        <span className="text-sm text-neutral-400">
          Last 24 hours • {sortedResultsWithDummy.length} transactions
        </span>
      </div>
      <div className="relative max-h-[400px]">
        <div 
          className="overflow-x-auto overflow-y-hidden"
          onScroll={handleScroll}
        >
          <table className="min-w-full divide-y divide-gray-700 border border-[0.5px] border-gray-700 table-fixed rounded-md">
            <thead className="bg-black sticky top-0">
              <tr>
                <th className="min-w-[130px] px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Queue ID
                </th>
                <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Network
                </th>
                <th className="min-w-[130px] px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  From
                </th>
                <th className="min-w-[130px] px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Queued
                </th>
                <th className="min-w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="min-w-[160px] px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tx Hash
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-700">
              {currentItems.map((result) => (
                <tr key={`${result.network}-${result.queueId}`}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-200">
                    {`${result.queueId.substring(0, 6)}...${result.queueId.substring(
                      result.queueId.length - 4
                    )}`}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                    <span className="text-neutral-200 flex items-center gap-2">
                      {result.network === 'Base Sep' && (
                        <img 
                          src="/BaseSep.png" 
                          alt="Base" 
                          className="w-4 h-4 min-w-[16px] min-h-[16px] object-contain"
                          onLoad={(e) => {
                            console.log('Base logo loaded', {
                              naturalWidth: e.currentTarget.naturalWidth,
                              naturalHeight: e.currentTarget.naturalHeight
                            });
                          }}
                          onError={(e) => {
                            console.error('Failed to load Base logo');
                            e.currentTarget.style.display = 'none';
                          }} 
                        />
                      )}
                      {result.network === 'OP Sep' && (
                        <img src="/OP.png" alt="Optimism Sep" className="w-4 h-4" />
                      )}
                      {result.network === 'Ethereum' && (
                        <img src="/Ethereum.png" alt="Ethereum" className="w-4 h-4" />
                      )}
                      {result.network}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                    {(() => {
                      const addressDisplay = `${result.toAddress.substring(0, 6)}...${result.toAddress.substring(
                        result.toAddress.length - 4
                      )}`;
                      
                      const getExplorerUrl = () => {
                        switch (result.network) {
                          case 'Base Sep':
                            return `https://base-sepolia.blockscout.com/address/${result.toAddress}?tab=tokens`;
                          case 'OP Sep':
                            return `https://optimism-sepolia.blockscout.com/address/${result.toAddress}?tab=tokens`;
                          case 'Ethereum':
                            return `https://etherscan.io/address/${result.toAddress}?tab=tokens`;
                          default:
                            return null;
                        }
                      };

                      const explorerUrl = getExplorerUrl();
                      
                      return explorerUrl ? (
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-30 hover:text-white"
                        >
                          {addressDisplay}
                        </a>
                      ) : (
                        addressDisplay
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                    {result.timestamp ? format(result.timestamp) : '----'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(getDisplayStatus(result))}`}
                    >
                      {getDisplayStatus(result)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                    {result.transactionHash && result.blockExplorerUrl ? (
                      <a
                        href={result.blockExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-30 hover:text-white"
                      >
                        {`${result.transactionHash.substring(0, 6)}...${result.transactionHash.substring(
                          result.transactionHash.length - 4
                        )}`}
                      </a>
                    ) : result.errorMessage ? (
                      <span className="text-red-600">{result.errorMessage}</span>
                    ) : (
                      "----"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showLeftGradient && (
          <div className="sm:hidden absolute left-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r from-black to-transparent" />
        )}
        {showRightGradient && (
          <div className="sm:hidden absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-black to-transparent" />
        )}
      </div>
      
      <div className="flex justify-between items-center mt-4 px-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-neutral-200 bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-neutral-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-neutral-200 bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}