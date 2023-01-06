// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Reentrancy {
    mapping(address => uint) deposits;

    function deposit() payable {
        deposits[msg.sender] = msg.value;
    }

    function withdrawWithReentrancy(uint256 amount) {
        require(deposits[msg.sender] >= amount);
        msg.sender.transfer(amount);
        deposits[msg.sender] -= amount;
    }
}
