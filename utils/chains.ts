export const CHAIN_NAMES: { [key: number]: string } = {
  1700: "Holesky",
  1: "Ethereum",
  84532: "Base Sepolia",
  // Add more chains as needed
};

export const getChainName = (chainId: number): string => {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
};

export const CHAIN_ID = 1700;
export const BASESEP_CHAIN_ID = 84532;
