import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Reentrancy", function () {
  async function deployContractsFixture() {
    const [accA, accB] = await ethers.getSigners();

    const ReentrancyExplorerFactory = await ethers.getContractFactory(
      "ReentrancyExplorer"
    );
    const ReentrancyFactory = await ethers.getContractFactory("Reentrancy");

    const reentrancy = await ReentrancyFactory.deploy();
    const reentrancyExplorer = await ReentrancyExplorerFactory.deploy(
      reentrancy.address
    );

    return { reentrancy, reentrancyExplorer, accA, accB };
  }

  it("Should explore reentrancy", async function () {
    const { reentrancy, reentrancyExplorer, accA, accB } = await loadFixture(
      deployContractsFixture
    );

    const explorerBalanceBefore = await ethers.provider.getBalance(
        reentrancyExplorer.address
      );
  
      const contractBalanceBefore = await ethers.provider.getBalance(
        reentrancy.address
      );
  
      console.log("Explorer balance Before ", explorerBalanceBefore.toString());
      console.log("Contract balance Before ", contractBalanceBefore.toString());

    await reentrancy
      .connect(accA)
      .deposit({ value: ethers.constants.WeiPerEther.mul(1) });

    await reentrancyExplorer
      .connect(accB)
      .firstStep({ value: ethers.constants.WeiPerEther.div(100) });

    await reentrancyExplorer.connect(accB).secondStep();

    const explorerBalanceAfter = await ethers.provider.getBalance(
      reentrancyExplorer.address
    );

    const contractBalanceAfter = await ethers.provider.getBalance(
      reentrancy.address
    );

    console.log("Explorer balance after ", explorerBalanceAfter.toString());
    console.log("Contract balance after ", contractBalanceAfter.toString());
  });
});
