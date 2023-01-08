// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Vault {
    mapping(address => uint256) private deposits;

    function deposit() external payable {
        deposits[msg.sender] = msg.value;
    }

    function withdrawWithReentrancy() external {
        require(deposits[msg.sender] > 0, "no balance left");
        (bool sent, ) = msg.sender.call{value: deposits[msg.sender]}("");
        require(sent, "failed to withdraw");

        deposits[msg.sender] = 0;
    }

    function withdrawWithoutReentrancy() external {
        require(deposits[msg.sender] > 0, "no balance left");
        deposits[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: deposits[msg.sender]}("");
        require(sent, "failed to withdraw");
    }
}
