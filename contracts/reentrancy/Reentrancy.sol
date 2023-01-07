// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Reentrancy {
    mapping(address => uint256) private deposits;

    function deposit() external payable {
        deposits[msg.sender] = msg.value;
    }

    function withdrawWithReentrancy(uint256 amount_) external {
        require(deposits[msg.sender] >= amount_, "no balance left");
        payable(msg.sender).transfer(amount_);
        deposits[msg.sender] -= amount_;
    }
}
