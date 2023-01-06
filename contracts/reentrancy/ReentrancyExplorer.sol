// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Reentrancy.sol";

contract ReentrancyExplorer {

    Reentrancy targetContract;

    constructor(address targetContract_) {
targetContract = Reentrancy(targetContract_);
    }

    depositToTarget() payable {
targetContract.deposit();
    }

    exploreTarget() {
targetContract.
    }

    fallback() payable {

    }

    withdraw() {
        msg.sender.transfer(address(this.balance));
    }
}