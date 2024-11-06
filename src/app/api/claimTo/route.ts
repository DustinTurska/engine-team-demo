import { Engine } from "@thirdweb-dev/engine";
import * as dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";

dotenv.config();

const CHAIN_ID = "11155420";
const BASESEP_CHAIN_ID = "84532";
const BACKEND_WALLET_ADDRESS = process.env.BACKEND_WALLET as string;
const CONTRACT_ADDRESS = process.env.ERC20_CONTRACT_ADDRESS_OPSEP as string;
const BASESEP_CONTRACT_ADDRESS = process.env.ERC20_CONTRACT_ADDRESS_BASESEP as string;

console.log("Environment Variables:");
console.log("CHAIN_ID:", CHAIN_ID);
console.log("BACKEND_WALLET_ADDRESS:", BACKEND_WALLET_ADDRESS);
console.log("CONTRACT_ADDRESS:", CONTRACT_ADDRESS);
console.log("ENGINE_URL:", process.env.ENGINE_URL);
console.log("ACCESS_TOKEN:", process.env.ACCESS_TOKEN ? "Set" : "Not Set");

const engine = new Engine({
  url: process.env.ENGINE_URL as string,
  accessToken: process.env.ACCESS_TOKEN as string,
});

type TransactionStatus = "Queued" | "Sent" | "Mined ⛏️" | "error";

interface ClaimResult {
  queueId: string;
  status: TransactionStatus;
  transactionHash?: string | undefined | null;
  blockExplorerUrl?: string | undefined | null;
  errorMessage?: string;
  toAddress?: string;
  amount?: string;
  chainId?: string;
}

// Store ongoing polling processes
const pollingProcesses = new Map<string, NodeJS.Timeout>();

// Helper function to make a single claim
async function makeClaimRequest(chainId: string, contractAddress: string, recipient: string, amount: string): Promise<ClaimResult> {
  const res = await engine.erc20.claimTo(
    chainId,
    contractAddress,
    BACKEND_WALLET_ADDRESS,
    {
      recipient,
      amount: amount.toString(),
    }
  );

  const initialResponse: ClaimResult = {
    queueId: res.result.queueId,
    status: "Queued",
    toAddress: recipient,
    amount,
    chainId,
  };

  startPolling(res.result.queueId);
  return initialResponse;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Request body:", body);
    
    // Handle batch transactions
    if (Array.isArray(body)) {
      const batchResults = await Promise.all(
        body.map(async (transaction) => {
          const { toAddress: recipient, amount } = transaction;
          if (!recipient || amount === undefined) {
            return {
              error: "Missing toAddress or amount",
              status: "error" as TransactionStatus,
            };
          }

          // Make parallel claims on both chains
          const [opsep, basesep] = await Promise.all([
            makeClaimRequest(CHAIN_ID, CONTRACT_ADDRESS, recipient, amount.toString()),
            makeClaimRequest(BASESEP_CHAIN_ID, BASESEP_CONTRACT_ADDRESS, recipient, amount.toString())
          ]);

          return {
            opsep,
            basesep,
          };
        })
      );

      return NextResponse.json(batchResults);
    }

    // Single transaction logic
    const toAddress = body.toAddress || body.receiver;
    const amount = body.amount || body.quantity;

    if (!toAddress || amount === undefined) {
      return NextResponse.json(
        { error: "Missing toAddress or amount" },
        { status: 400 }
      );
    }

    // Make parallel claims on both chains
    const [opsep, basesep] = await Promise.all([
      makeClaimRequest(CHAIN_ID, CONTRACT_ADDRESS, toAddress, amount.toString()),
      makeClaimRequest(BASESEP_CHAIN_ID, BASESEP_CONTRACT_ADDRESS, toAddress, amount.toString())
    ]);

    return NextResponse.json({
      opsep,
      basesep,
    });

  } catch (error: unknown) {
    console.error("Error claiming ERC20 tokens", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          status: "error" as TransactionStatus,
          error: "Error claiming ERC20 tokens",
          details: error.message,
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { status: "error" as TransactionStatus, error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

function startPolling(queueId: string) {
  const maxPollingTime = 5 * 60 * 1000; // 5 minutes timeout
  const startTime = Date.now();
  
  const pollingInterval = setInterval(async () => {
    try {
      // Check if we've exceeded the maximum polling time
      if (Date.now() - startTime > maxPollingTime) {
        clearInterval(pollingInterval);
        pollingProcesses.delete(queueId);
        console.log(`Polling timeout for queue ID: ${queueId}`);
        return;
      }

      const result = await pollToMine(queueId);
      if (result.status === "Mined ⛏️" || result.status === "error") {
        clearInterval(pollingInterval);
        pollingProcesses.delete(queueId);
        console.log("Final result:", result);
      }
    } catch (error) {
      console.error("Error in polling process:", error);
      clearInterval(pollingInterval);
      pollingProcesses.delete(queueId);
    }
  }, 1500);

  pollingProcesses.set(queueId, pollingInterval);
}

async function pollToMine(queueId: string): Promise<ClaimResult> {
  console.log(`Polling for queue ID: ${queueId}`);
  const status = await engine.transaction.status(queueId);
  console.log(`Current status: ${status.result.status}`);

  switch (status.result.status) {
    case "queued":
      console.log("Transaction is queued");
      return { queueId, status: "Queued" };
    case "sent":
      console.log("Transaction is submitted to the network");
      return { queueId, status: "Sent" };
    case "mined":
      console.log("Transaction mined! 🥳 ERC20 tokens have been claimed", queueId);
      const transactionHash = status.result.transactionHash;
      const blockExplorerUrl = status.result.chainId === BASESEP_CHAIN_ID
        ? `https://base-sepolia.blockscout.com/tx/${transactionHash}`
        : `https://optimism-sepolia.blockscout.com/tx/${transactionHash}`;
      console.log("View transaction on the blockexplorer:", blockExplorerUrl);
      return {
        queueId,
        status: "Mined ⛏️",
        transactionHash: transactionHash ?? undefined,
        blockExplorerUrl: blockExplorerUrl,
      };
    case "errored":
      console.error("Claim failed", queueId);
      console.error(status.result.errorMessage);
      return {
        queueId,
        status: "error",
        errorMessage: "Error",
      };
    default:
      return { queueId, status: "Queued" };
  }
}

// Add a new endpoint to check the status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queueId = searchParams.get('queueId');

  if (!queueId) {
    return NextResponse.json({ error: "Missing queueId" }, { status: 400 });
  }

  try {
    const result = await pollToMine(queueId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking transaction status:", error);
    return NextResponse.json(
      { 
        status: "error" as TransactionStatus, 
        error: "Failed to check transaction status" 
      }, 
      { status: 500 }
    );
  }
}