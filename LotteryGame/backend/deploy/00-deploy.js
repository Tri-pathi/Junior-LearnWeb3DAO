const { network } = require("hardhat");
const { VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE } = require("../constant");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("deploying.......");
  const args = [VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE];
  const lottery = await deploy("Lottery", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: network.config.waitConfirmations || 1,
  });

  log("Lottery Contract is deployed at ", lottery.address);

  console.log("Verifying Contract........")
  await sleep(30000);
  await hre.run("verify:verify",{
    address:lottery.address,
    constructorArguments: args,
  });
};

function sleep(ms){
  return new Promise((res)=>setTimeout(res,ms));
}

//verified contract link=https://mumbai.polygonscan.com/address/0x6Ea755871D5421F8E6fDfe74984AE22e09843Be4#code

//contract address=0x6Ea755871D5421F8E6fDfe74984AE22e09843Be4;

