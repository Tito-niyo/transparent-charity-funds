async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  const adminAddress = process.env.ADMIN_WALLET || deployer.address;
  console.log(`Admin wallet set to: ${adminAddress}`);

  const charityFundFactory = await ethers.getContractFactory("TransparentCharityFund");
  const charityFund = await charityFundFactory.deploy(adminAddress);
  await charityFund.waitForDeployment();

  console.log(`TransparentCharityFund deployed to: ${await charityFund.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
