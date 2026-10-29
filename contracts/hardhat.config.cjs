require("@nomicfoundation/hardhat-toolbox");

/** Local Hardhat network only: no RPC URLs or deployment accounts configured. */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
      { version: "0.7.6", settings: { optimizer: { enabled: false } } }
    ]
  },
  networks: { hardhat: { chainId: 31337 } },
  paths: { sources: "./src", tests: "./test" }
};
