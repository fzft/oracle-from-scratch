const hre = require("hardhat");

const OracleAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CallerAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const privateKey = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
const provider = new hre.ethers.providers.JsonRpcProvider("http://localhost:8545");
const wallet = new ethers.Wallet(privateKey, provider);


async function getOracleContract() {
    const OracleContract = await hre.ethers.getContractFactory("EthPriceOracle");
    const oracleContract = await OracleContract.attach(OracleAddress)
    return oracleContract;
}

async function getCallerContract() {
    const CallerContract = await hre.ethers.getContractFactory("CallerContract");
    const callerContract = CallerContract.attach(CallerAddress)
    return callerContract;
}

async function setOracleInstanceAddress(callerContract, oracleAddress) {
    const tx = await callerContract.setOracleInstanceAddress(oracleAddress);
    return tx;
}

async function getLatestEthPrice(callerContract, wallet) {
    const id = await callerContract.connect(wallet).getLatestEthPrice();
    return id;
}

async function main() {
    const callerContract = await getCallerContract();
    // await setOracleInstanceAddress(callerContract, OracleAddress)
    await callerContract.updateEthPrice()

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });