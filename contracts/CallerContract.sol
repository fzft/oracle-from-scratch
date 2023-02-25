// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EthPriceOracleInterface.sol";

contract CallerContract {
    uint256 private ethPrice;
    EthPriceOracleInterface private oracleInstance;
    address private oracleAddress;
    mapping (uint256 => bool) myRequests;
    event newOracleAddressEvent(address indexed newOracleAddress);
    event ReceivedNewRequestIdEvent(uint256 indexed id);
    event PriceUpdatedEvent(uint256 newPrice, uint256 id);
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "You are not the oracle.");
        _;
    }

    function setOracleInstanceAddress(address _oracleAddress) public {
        oracleAddress = _oracleAddress;
        oracleInstance = EthPriceOracleInterface(oracleAddress);
        emit newOracleAddressEvent(oracleAddress);
    }
    
    function updateEthPrice() public {
        uint256 id = oracleInstance.getLatestEthPrice();
        myRequests[id] = true;
        emit ReceivedNewRequestIdEvent(id);
    }

    function callback(uint256 _id, uint256 _price) public onlyOracle {
        require(myRequests[_id] == true, "This ID does not exist in CallerContract.");
        ethPrice = _price;
        delete myRequests[_id];
        emit PriceUpdatedEvent(_price, _id);
    } 
}


