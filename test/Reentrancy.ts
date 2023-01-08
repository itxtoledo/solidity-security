import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Reentrancy", function () {
  async function deployContractsFixture() {
    const [accA, accB] = await ethers.getSigners();

    const ReentrancyAttackerFactory = await ethers.getContractFactory(
      "ReentrancyAttacker"
    );
    const VaultFactory = await ethers.getContractFactory("Vault");

    const vault = await VaultFactory.deploy();
    const reentrancyAttacker = await ReentrancyAttackerFactory.deploy(
      vault.address
    );

    return { vault, reentrancyAttacker, accA, accB };
  }

  it("Should explore reentrancy", async function () {
    const { vault, reentrancyAttacker, accA, accB } = await loadFixture(
      deployContractsFixture
    );

    const realDepositedAmount = ethers.constants.WeiPerEther.div(10);

    // normal user deposit
    await vault
      .connect(accA)
      .deposit({ value: ethers.constants.WeiPerEther.mul(1) });

    const vaultBalanceBefore = await ethers.provider.getBalance(vault.address);

    // attacker deposit and attack
    await reentrancyAttacker
      .connect(accB)
      .drain({ value: realDepositedAmount });

    const attackerBalanceAfter = await ethers.provider.getBalance(
      reentrancyAttacker.address
    );

    const vaultBalanceAfter = await ethers.provider.getBalance(vault.address);

    console.log(
      "Vault original balance    ",
      ethers.utils
        .formatUnits(vaultBalanceBefore.toString(), "ether")
        .toString()
    );

    console.log(
      "Vault balance after       ",
      ethers.utils.formatUnits(vaultBalanceAfter.toString(), "ether").toString()
    );

    console.log(
      "Attacker balance after    ",
      ethers.utils
        .formatUnits(attackerBalanceAfter.toString(), "ether")
        .toString()
    );

    console.log(
      "Exploit with success?     ",
      attackerBalanceAfter.gt(realDepositedAmount)
    );
  });
});
