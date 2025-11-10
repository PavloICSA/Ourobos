const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying OuroborosDAO contract...");

  // Get the contract factory
  const OuroborosDAO = await hre.ethers.getContractFactory("OuroborosDAO");
  
  // Deploy the contract
  const dao = await OuroborosDAO.deploy();
  
  await dao.waitForDeployment();
  
  const address = await dao.getAddress();
  
  console.log(`OuroborosDAO deployed to: ${address}`);
  
  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (chainId: ${network.chainId})`);
  
  // Get deployer information
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployed by: ${deployer.address}`);
  
  // Save contract address and ABI to frontend config
  const config = {
    address: address,
    chainId: Number(network.chainId),
    network: network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };
  
  // Get the contract ABI
  const artifact = await hre.artifacts.readArtifact("OuroborosDAO");
  config.abi = artifact.abi;
  
  // Ensure the config directory exists
  const configDir = path.join(__dirname, "../../src/blockchain");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Write config file
  const configPath = path.join(configDir, "contract-config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(`Contract configuration saved to: ${configPath}`);
  
  // Display initial contract state
  const votingPeriod = await dao.votingPeriod();
  const quorum = await dao.quorum();
  const owner = await dao.owner();
  
  console.log("\nInitial Contract State:");
  console.log(`  Owner: ${owner}`);
  console.log(`  Voting Period: ${votingPeriod} seconds`);
  console.log(`  Quorum: ${quorum}%`);
  console.log(`  Proposal Count: 0`);
  console.log(`  Current Generation: 0`);
  
  console.log("\nDeployment complete!");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
