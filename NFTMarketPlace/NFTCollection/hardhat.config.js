require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork:"hardhat",
  solidity: "0.8.17",
  networks:{
    hardhat:{
      chainId:31337,
    },
    mumbai:{
      url:process.env.POLYGON_MUMBAI_URL,
      accounts:[process.env.PRIVATE_KEY],

    },

  },
  namedAccounts:{
    deployer:{
      default:0,
      1:0,
    },
  },
  mocha:{
    timeout:500000,
  }
  

};
