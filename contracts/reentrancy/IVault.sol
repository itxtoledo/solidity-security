// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IVault {
    /**
     * @dev deposit funds into the vault
     */
    function deposit() external payable;

    /**
     * @dev withdraw funds from vault
     */
    function withdraw() external;
}
