const hre = require("hardhat");
const axios = require("axios")
const BN = require("bn.js")

const OracleAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CallerAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

var pendingRequests = []
const CHUNK_SIZE = 3;
const MAX_RETIRES = 5;
const SEELP_INTERVAL = 2000;

async function getOracleContract() {
    const OracleContract = await hre.ethers.getContractFactory("EthPriceOracle");
    const oracleContract = OracleContract.attach(OracleAddress)
    return oracleContract;
}

async function getCallerContract() {
    const CallerContract = await hre.ethers.getContractFactory("CallerContract");
    const callerContract = CallerContract.attach(CallerAddress)
    return callerContract;
}


// https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT
async function retreieveLatestEthPrice() {
    const resp = await axios({
        url: "https://api.binance.com/api/v3/ticker/price",
        method: "get",
        params: {
            symbol: "ETHUSDT"
        }
    } )
    console.log("resp", resp.data)
    return resp.data.price;
}

function addRequestToPendingQueue(event) {
    pendingRequests.push(event)
}

async function processQueue(oracleContract, oracleAddress) {
    let processedRequests = 0
    while (pendingRequests.length > 0 && processedRequests < CHUNK_SIZE) {
        const {_, id} = pendingRequests.shift()
        const callerAddress = CallerAddress;
        await processRequest(oracleContract, oracleAddress,  id.toNumber(), callerAddress)
        processedRequests++;
    }
}

async function processRequest(oracleContract, oracleAddress, id, callerAddress) {
    let retries = 0;
    while (retries < MAX_RETIRES) {
        try {
            const ethPrice = await retreieveLatestEthPrice();
            await setLatestEthPrice(oracleContract, oracleAddress,callerAddress, ethPrice, id)
            return ;
        } catch (error) {
            if (retries === MAX_RETIRES - 1) {
                await setLatestEthPrice(oracleContract,oracleAddress, callerAddress, "0", id)
                return
            }
            retries++;
        }
    }
}

async function setLatestEthPrice(oracleContract,oracleAddress, callerAddress, ethPrice, id) {
    ethPrice = ethPrice.replace(".", "")
    const multiplier = new BN(10**10, 10)
    const ethPriceInt = (new BN(parseInt(ethPrice) , 10)).mul(multiplier)
    const idInt = new BN(parseInt(id))
    try{
        console.log("ethPriceInt: ", ethPriceInt.toString(), "callerAddress:", callerAddress, "id:", idInt.toString())
        await oracleContract.setLatestEthPrice(ethPriceInt.toString(), callerAddress, idInt.toString())
    }catch(error){
        console.log("error", error)
    }
}

async function oracleFilterEvents(oracleContract) {
    oracleContract.on("GetLatestEthPriceEvent", (callerAddress, id)=> {
        console.log("GetLatestEthPriceEvent", callerAddress, id)
        addRequestToPendingQueue({callerAddress, id})
    })

    oracleContract.on("SetLatestEthPriceEvent", (event)=> {
        console.log("SetLatestEthPriceEvent", event)
    })
}

async function callerFilterEvents(callerContract) {
    callerContract.on("PriceUpdatedEvent", (price, id)=> {
        console.log("New PriceUpdated event. ethPrice: ", price)
    })

    callerContract.on("ReceivedNewRequestIdEvent", (id)=> {
        console.log("CallerContact received New request Id: ", id.toNumber())
    })
}


async function main() {
    const oracleContract = await getOracleContract();
    const callerContract = await getCallerContract();
    oracleFilterEvents(oracleContract)
    callerFilterEvents(callerContract)
    setInterval(async () => {
        await processQueue(oracleContract, OracleAddress)
    }, SEELP_INTERVAL)
}



main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });