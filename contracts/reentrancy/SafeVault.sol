// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./IVault.sol";

contract SafeVault is IVault {
    mapping(address => uint256) private deposits;

    function deposit() external payable {
        deposits[msg.sender] = msg.value;
    }

    function withdraw() external {
        require(deposits[msg.sender] > 0, "no balance left");

        deposits[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: deposits[msg.sender]}("");
        require(sent, "failed to withdraw");
    }
}
