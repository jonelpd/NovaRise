require("@nomicfoundation/hardhat-toolbox");

/**
 * Base mainnet target: chain ID 8453.
 * No mainnet signing account is configured: deployment is deliberately disabled
 * until independent audit, legal review, custody setup and explicit go/no-go.
 * BASE_MAINNET_RPC_URL is optional and is used for read-only RPC queries.
 */
const baseUrl = process.env.BASE_MAINNET_RPC_URL;
if (baseUrl && !/^https:\/\//.test(baseUrl)) {
  throw new Error("BASE_MAINNET_RPC_URL must use HTTPS");
}
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
      { version: "0.7.6", settings: { optimizer: { enabled: false } } }
    ]
  },
  networks: {
    hardhat: { chainId: 31337 },
    ...(baseUrl ? { base: { url: baseUrl, chainId: 8453, accounts: [] } } : {})
  },
  paths: { sources: "./src", tests: "./test" }
};
