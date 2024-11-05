export const CHAIN_NAMES: { [key: number]: string } = {
  1700: "Holesky",
  1: "Ethereum",
  11155111: "Sepolia",
  137: "Polygon",
  // Add more chains as needed
};

export const getChainName = (chainId: number): string => {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
};

export const CHAIN_ID = 1700;