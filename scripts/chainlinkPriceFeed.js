const hre = require("hardhat");

const ChainlinkContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

async function getChainlinkContract() {
    const ChainlinkContract = await hre.ethers.getContractFactory("PriceConsumerV3");
    const chainlinkContract = ChainlinkContract.attach(ChainlinkContractAddress)
    return chainlinkContract;
}

async function main() {
    const contract = await getChainlinkContract()
    const price = await contract.getLatestEthPrice()
    console.log(price)
}


main().catch((error) => {
console.error(error);
process.exitCode = 1;
});

