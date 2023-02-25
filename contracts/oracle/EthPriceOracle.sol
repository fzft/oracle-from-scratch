// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CallContractInterface.sol";

contract EthPriceOracle is Ownable {
    uint private randNonce = 0;
    uint private modulus = 1000;
    mapping (uint256 => bool) pendingRequests;
    event GetLatestEthPriceEvent(address callerAddress, uint id);
    event SetLatestEthPriceEvent(uint256 ethPrice, address callerAddress);

    function getLatestEthPrice() public returns (uint256) {
        randNonce++;
        uint id = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % modulus;
        pendingRequests[id] = true;
        emit GetLatestEthPriceEvent(msg.sender, id);
        return id;
    }

    function setLatestEthPrice(uint256 _ethPrice, address _callerAddress,  uint256 _id) public onlyOwner {
        require(pendingRequests[_id] == true, "This ID does not exist in EthPriceOracle.");
        delete pendingRequests[_id];
        CallerContractInterface callerInstance = CallerContractInterface(_callerAddress);
        callerInstance.callback(_id, _ethPrice);
        emit SetLatestEthPriceEvent(_ethPrice, msg.sender);
    }
}
