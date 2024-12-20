"use client";

import React, { useState } from "react";
import { format } from 'timeago.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

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
    <Card className="w-full mt-8 bg-background">
      <CardHeader className="flex flex-row justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">
          Transaction Results
        </h2>
        <span className="text-sm text-muted-foreground">
          Last 24 hours • {sortedResultsWithDummy.length} transactions
        </span>
      </CardHeader>
      <CardContent className="relative max-h-[400px]">
        <div className="overflow-x-auto" onScroll={handleScroll}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[130px]">Queue ID</TableHead>
                <TableHead className="min-w-[120px]">Network</TableHead>
                <TableHead className="min-w-[130px]">From</TableHead>
                <TableHead className="min-w-[130px]">Queued</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[160px]">Tx Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((result) => (
                <TableRow key={`${result.network}-${result.queueId}`}>
                  <TableCell className="font-medium">
                    {`${result.queueId.substring(0, 6)}...${result.queueId.substring(
                      result.queueId.length - 4
                    )}`}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      {result.network === 'Base Sep' && (
                        <img src="/BaseSep.png" alt="Base" className="w-4 h-4" />
                      )}
                      {result.network === 'OP Sep' && (
                        <img src="/OP.png" alt="Optimism Sep" className="w-4 h-4" />
                      )}
                      {result.network === 'Ethereum' && (
                        <img src="/Ethereum.png" alt="Ethereum" className="w-4 h-4" />
                      )}
                      {result.network}
                    </span>
                  </TableCell>
                  <TableCell>
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
                          className="text-[hsl(var(--link-foreground))] hover:text-foreground"
                        >
                          {addressDisplay}
                        </a>
                      ) : (
                        addressDisplay
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {result.timestamp ? format(result.timestamp) : '----'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(getDisplayStatus(result))}`}>
                      {getDisplayStatus(result)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {result.transactionHash && result.blockExplorerUrl ? (
                      <a
                        href={result.blockExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[hsl(var(--link-foreground))] hover:text-foreground"
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {showLeftGradient && (
          <div className="sm:hidden absolute left-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r from-background to-transparent" />
        )}
        {showRightGradient && (
          <div className="sm:hidden absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-background to-transparent" />
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}