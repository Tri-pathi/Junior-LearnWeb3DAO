const { network } = require("hardhat");


module.exports=async({deployments,getNamedAccounts})=>{
  const{deploy,log}=deployments;
  const {deployer}=await getNamedAccounts();
  const metadataURL = ["ipfs://Qmbygo38DWF1V8GttM1zy89KzyZTPU2FLUzQtiDvB7q6i5/"];
  const lw3Punks= await deploy("LW3Punks",{
    from:deployer,
    log:true,
    args:metadataURL,
    waitConfirmations:network.config.waitConfirmations||1,
  })

  log(`LW3Punks Contract is deployed at contract Address ${lw3Punks.address}`);


}
//0x6e46712Bc85bc00f3B5E74E2ED980E2cf953c71B