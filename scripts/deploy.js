// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // const OracleContract = await hre.ethers.getContractFactory("EthPriceOracle");
  // const oracleContract = await OracleContract.deploy();

  // await oracleContract.deployed();

  // const CallerContract = await hre.ethers.getContractFactory("CallerContract");
  // const callerContract = await CallerContract.deploy();

  // await callerContract.deployed();

  const PriceConsumer = await hre.ethers.getContractFactory("PriceConsumerV3")
  const priceConsumer = await PriceConsumer.deploy();
  
  await priceConsumer.deployed()

  // console.log(
  //   `oracleContract  deployed to ${oracleContract.address}`
  // );

  // console.log(
  //   `callerContract  deployed to ${callerContract.address}`
  // );

  console.log(
    `priceConsumer  deployed to ${priceConsumer.address}`
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
