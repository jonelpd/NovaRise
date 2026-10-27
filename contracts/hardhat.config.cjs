require("@nomicfoundation/hardhat-toolbox");

/** Local Hardhat network only: no RPC URLs or deployment accounts configured. */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: { hardhat: { chainId: 31337 } }
};
