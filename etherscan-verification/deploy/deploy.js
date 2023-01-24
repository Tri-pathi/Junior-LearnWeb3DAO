


const {ethers} =require("hardhat");

async function main(){
 

    const verifyContractFactory=await ethers.getContractFactory("Verify");

    const verifyContract=await verifyContractFactory.deploy();

    await verifyContract.deployed();
    console.log(`Deployed at Contract Address ${verifyContract.address}`);

    console.log("Get ready foe verification........");
    await sleep(40000);



    await hre.run("verify:verify",{
        address: verifyContract.address,
        costructorArguments:[],
    })
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//deployed contract Address=0x3D983D42f75512989E48e391Fc175Aa41e3a2E3f

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  