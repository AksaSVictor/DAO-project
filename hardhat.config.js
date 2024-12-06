require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "localhost",
  networks: {
    sepolia: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      // See its defaults
    }
  },
  sepolia: {
    url: "https://eth-sepolia.g.alchemy.com/v2/udeUdydN_t9ZVItqjvH-XUriBwqf3MQB",
    accounts: ["49bee6f9a7dfa49988a4a61f1baff2d0a1f88c3169f1c8d670ee682766d2c1ae"]
  },  
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
};