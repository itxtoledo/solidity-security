import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Reentrancy", function () {
  async function deployVulnerableVaultFixture() {
    const [accA, accB] = await ethers.getSigners();

    const ReentrancyAttackerFactory = await ethers.getContractFactory(
      "ReentrancyAttacker"
    );
    const VulnerableFactory = await ethers.getContractFactory(
      "VulnerableVault"
    );

    const vault = await VulnerableFactory.deploy();
    const reentrancyAttacker = await ReentrancyAttackerFactory.deploy(
      vault.address
    );

    return { vault, reentrancyAttacker, accA, accB };
  }

  async function deploySafeVaultFixture() {
    const [accA, accB] = await ethers.getSigners();

    const ReentrancyAttackerFactory = await ethers.getContractFactory(
      "ReentrancyAttacker"
    );
    const SafeVaultFactory = await ethers.getContractFactory("SafeVault");

    const vault = await SafeVaultFactory.deploy();
    const reentrancyAttacker = await ReentrancyAttackerFactory.deploy(
      vault.address
    );

    return { vault, reentrancyAttacker, accA, accB };
  }

  it("Should explore reentrancy with VunerableVault", async function () {
    const { vault, reentrancyAttacker, accA, accB } = await loadFixture(
      deployVulnerableVaultFixture
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

    console.table({
      "Vault original balance": ethers.utils
        .formatUnits(vaultBalanceBefore.toString(), "ether")
        .toString(),
      "Vault balance after": ethers.utils
        .formatUnits(vaultBalanceAfter.toString(), "ether")
        .toString(),
      "Attacker balance after": ethers.utils
        .formatUnits(attackerBalanceAfter.toString(), "ether")
        .toString(),
      "Exploit with success?": attackerBalanceAfter.gt(realDepositedAmount),
    });

    expect(vaultBalanceAfter).to.equal(ethers.BigNumber.from(0));
  });

  it("Shouldn't explore reentrancy with SafeVault", async function () {
    const { vault, reentrancyAttacker, accA, accB } = await loadFixture(
      deploySafeVaultFixture
    );

    const realDepositedAmount = ethers.constants.WeiPerEther.div(10);

    // normal user deposit
    await vault
      .connect(accA)
      .deposit({ value: ethers.constants.WeiPerEther.mul(1) });

    const vaultBalanceBefore = await ethers.provider.getBalance(vault.address);

    // attacker deposit and attack
    await expect(
      reentrancyAttacker.connect(accB).drain({ value: realDepositedAmount })
    ).to.revertedWith("failed to withdraw");

    const attackerBalanceAfter = await ethers.provider.getBalance(
      reentrancyAttacker.address
    );

    const vaultBalanceAfter = await ethers.provider.getBalance(vault.address);

    console.table({
      "Vault original balance": ethers.utils
        .formatUnits(vaultBalanceBefore.toString(), "ether")
        .toString(),
      "Vault balance after": ethers.utils
        .formatUnits(vaultBalanceAfter.toString(), "ether")
        .toString(),
      "Attacker balance after": ethers.utils
        .formatUnits(attackerBalanceAfter.toString(), "ether")
        .toString(),
      "Exploit with success?": attackerBalanceAfter.gt(realDepositedAmount),
    });

    expect(vaultBalanceAfter).to.equal(vaultBalanceBefore);
  });
});
