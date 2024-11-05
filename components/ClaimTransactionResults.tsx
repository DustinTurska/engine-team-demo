"use client";

import React, { useState } from "react";
import { format } from 'timeago.js';
import { getChainName } from '../utils/chains';

interface ClaimTransactionResults {
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

interface ClaimTransactionResultsProps {
  results: ClaimTransactionResults[];
}

export function ClaimTransactionResults({ results }: ClaimTransactionResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const dummyTransaction: ClaimTransactionResults = {
    queueId: "0x1234567890abcdef",
    status: "Mined ⛏️",
    transactionHash: "0xabcdef1234567890",
    blockExplorerUrl: "https://etherscan.io/tx/0xabcdef1234567890",
    toAddress: "0x1234567890abcdef",
    amount: "1.0",
    timestamp: Date.now() - 30 * 60 * 1000,
    chainId: 1
  };

  const sortedResults = [...results].reverse();
  const sortedResultsWithDummy = [...sortedResults, dummyTransaction];
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedResultsWithDummy.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const getDisplayStatus = (result: ClaimTransactionResults) => {
    if (result.status === "Mined ⛏️" && !result.transactionHash) {
      return "Pending";
    }
    return result.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mined ⛏️":
        return "bg-green-500 text-green-100";
      case "Queued":
      case "Pending":
        return "bg-yellow-500 text-yellow-100";
      default:
        return "bg-red-500 text-red-100";
    }
  };

  return (
    <div className="mt-8 w-full h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-neutral-200">
          Transaction Results
        </h2>
        <span className="text-sm text-neutral-400">
          Last 24 hours • {sortedResults.length} transactions
        </span>
      </div>
      <div className="h-[320px] overflow-y-auto scrollbar-none">
        <table className="min-w-full divide-y divide-gray-700 border border-gray-700">
          <thead className="bg-black sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Queue ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Chain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Queued
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tx Hash
              </th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-gray-700">
            {currentItems.map((result) => (
              <tr key={result.queueId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-200">
                  {`${result.queueId.substring(0, 6)}...${result.queueId.substring(
                    result.queueId.length - 4
                  )}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {getChainName(result.chainId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {`${result.toAddress.substring(0, 6)}...${result.toAddress.substring(
                    result.toAddress.length - 4
                  )}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {result.timestamp ? format(result.timestamp) : '----'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(getDisplayStatus(result))}`}
                  >
                    {getDisplayStatus(result)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {result.transactionHash && result.blockExplorerUrl ? (
                    <a
                      href={result.blockExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {`${result.transactionHash.substring(
                        0,
                        6
                      )}...${result.transactionHash.substring(
                        result.transactionHash.length - 6
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
    </div>
  );
}