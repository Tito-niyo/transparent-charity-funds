const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TransparentCharityFund", function () {
  async function deployFixture() {
    const [admin, donor, recipient] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("TransparentCharityFund");
    const contract = await factory.deploy(admin.address);
    await contract.waitForDeployment();
    return { contract, admin, donor, recipient };
  }

  it("accepts donations and tracks totals", async function () {
    const { contract, donor } = await deployFixture();
    const donation = ethers.parseEther("1");

    await contract.connect(donor).donate({ value: donation });

    expect(await contract.totalDonated()).to.equal(donation);
    expect(await contract.donationsByAddress(donor.address)).to.equal(donation);
    expect(await contract.getContractBalance()).to.equal(donation);
  });

  it("allows admin to create and pay expense", async function () {
    const { contract, donor, recipient } = await deployFixture();
    const donation = ethers.parseEther("2");
    const expenseAmount = ethers.parseEther("0.5");

    await contract.connect(donor).donate({ value: donation });
    await contract.createExpense("Buy food supplies", expenseAmount, recipient.address);

    const beforeBalance = await ethers.provider.getBalance(recipient.address);
    await contract.payExpense(0);
    const afterBalance = await ethers.provider.getBalance(recipient.address);

    const expense = await contract.getExpense(0);
    expect(expense.paid).to.equal(true);
    expect(await contract.totalSpent()).to.equal(expenseAmount);
    expect(afterBalance - beforeBalance).to.equal(expenseAmount);
  });

  it("prevents non-admin from creating expense", async function () {
    const { contract, donor, recipient } = await deployFixture();
    await expect(
      contract.connect(donor).createExpense("Unauthorized", ethers.parseEther("0.1"), recipient.address)
    ).to.be.revertedWith("Only admin can call this");
  });
});
