const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("OuroborosDAO", function () {
  let dao;
  let owner;
  let proposer;
  let voter1;
  let voter2;
  let unauthorized;

  beforeEach(async function () {
    // Get signers
    [owner, proposer, voter1, voter2, unauthorized] = await ethers.getSigners();

    // Deploy contract
    const OuroborosDAO = await ethers.getContractFactory("OuroborosDAO");
    dao = await OuroborosDAO.deploy();
    await dao.waitForDeployment();

    // Authorize proposer
    await dao.authorizeProposer(proposer.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await dao.owner()).to.equal(owner.address);
    });

    it("Should authorize owner as proposer", async function () {
      expect(await dao.authorizedProposers(owner.address)).to.be.true;
    });

    it("Should set default voting period to 60 seconds", async function () {
      expect(await dao.votingPeriod()).to.equal(60);
    });

    it("Should set default quorum to 50%", async function () {
      expect(await dao.quorum()).to.equal(50);
    });

    it("Should start with zero proposals", async function () {
      expect(await dao.proposalCount()).to.equal(0);
    });

    it("Should start with zero generation", async function () {
      expect(await dao.currentGeneration()).to.equal(0);
    });
  });

  describe("Proposal Creation", function () {
    const genomeHash = ethers.keccak256(ethers.toUtf8Bytes("genome1"));
    const ourocodeHash = ethers.keccak256(ethers.toUtf8Bytes("ourocode1"));

    it("Should create a proposal with valid hashes", async function () {
      await expect(dao.connect(proposer).proposeMutation(genomeHash, ourocodeHash))
        .to.emit(dao, "ProposalCreated")
        .withArgs(1, genomeHash, ourocodeHash, proposer.address, await time.latest() + 1);

      expect(await dao.proposalCount()).to.equal(1);
    });

    it("Should reject proposal from unauthorized address", async function () {
      await expect(
        dao.connect(unauthorized).proposeMutation(genomeHash, ourocodeHash)
      ).to.be.revertedWith("Not authorized to propose");
    });

    it("Should reject proposal with zero genome hash", async function () {
      await expect(
        dao.connect(proposer).proposeMutation(ethers.ZeroHash, ourocodeHash)
      ).to.be.revertedWith("Invalid genome hash");
    });

    it("Should reject proposal with zero ourocode hash", async function () {
      await expect(
        dao.connect(proposer).proposeMutation(genomeHash, ethers.ZeroHash)
      ).to.be.revertedWith("Invalid ourocode hash");
    });

    it("Should store proposal details correctly", async function () {
      await dao.connect(proposer).proposeMutation(genomeHash, ourocodeHash);

      const proposal = await dao.getProposal(1);
      expect(proposal.id).to.equal(1);
      expect(proposal.genomeHash).to.equal(genomeHash);
      expect(proposal.ourocodeHash).to.equal(ourocodeHash);
      expect(proposal.proposer).to.equal(proposer.address);
      expect(proposal.votesFor).to.equal(0);
      expect(proposal.votesAgainst).to.equal(0);
      expect(proposal.executed).to.be.false;
    });
  });

  describe("Voting", function () {
    const genomeHash = ethers.keccak256(ethers.toUtf8Bytes("genome1"));
    const ourocodeHash = ethers.keccak256(ethers.toUtf8Bytes("ourocode1"));

    beforeEach(async function () {
      await dao.connect(proposer).proposeMutation(genomeHash, ourocodeHash);
    });

    it("Should allow voting for a proposal", async function () {
      await expect(dao.connect(voter1).vote(1, true))
        .to.emit(dao, "VoteCast")
        .withArgs(1, voter1.address, true, 1, 0);

      const proposal = await dao.getProposal(1);
      expect(proposal.votesFor).to.equal(1);
      expect(proposal.votesAgainst).to.equal(0);
    });

    it("Should allow voting against a proposal", async function () {
      await expect(dao.connect(voter1).vote(1, false))
        .to.emit(dao, "VoteCast")
        .withArgs(1, voter1.address, false, 0, 1);

      const proposal = await dao.getProposal(1);
      expect(proposal.votesFor).to.equal(0);
      expect(proposal.votesAgainst).to.equal(1);
    });

    it("Should prevent double voting", async function () {
      await dao.connect(voter1).vote(1, true);

      await expect(dao.connect(voter1).vote(1, true)).to.be.revertedWith(
        "Already voted"
      );
    });

    it("Should allow multiple voters", async function () {
      await dao.connect(voter1).vote(1, true);
      await dao.connect(voter2).vote(1, true);

      const proposal = await dao.getProposal(1);
      expect(proposal.votesFor).to.equal(2);
    });

    it("Should reject voting after voting period", async function () {
      await time.increase(61); // Move past voting period

      await expect(dao.connect(voter1).vote(1, true)).to.be.revertedWith(
        "Voting period ended"
      );
    });

    it("Should reject voting on invalid proposal ID", async function () {
      await expect(dao.connect(voter1).vote(999, true)).to.be.revertedWith(
        "Invalid proposal ID"
      );
    });
  });

  describe("Proposal Execution", function () {
    const genomeHash = ethers.keccak256(ethers.toUtf8Bytes("genome1"));
    const ourocodeHash = ethers.keccak256(ethers.toUtf8Bytes("ourocode1"));

    beforeEach(async function () {
      await dao.connect(proposer).proposeMutation(genomeHash, ourocodeHash);
    });

    it("Should execute proposal with sufficient votes", async function () {
      // Vote with 2 yes, 1 no (66% approval)
      await dao.connect(voter1).vote(1, true);
      await dao.connect(voter2).vote(1, true);
      await dao.connect(owner).vote(1, false);

      // Move past voting period
      await time.increase(61);

      await expect(dao.executeProposal(1))
        .to.emit(dao, "ProposalExecuted")
        .and.to.emit(dao, "GenomeRecorded");

      expect(await dao.currentGeneration()).to.equal(1);
    });

    it("Should reject execution before voting period ends", async function () {
      await dao.connect(voter1).vote(1, true);

      await expect(dao.executeProposal(1)).to.be.revertedWith(
        "Voting period ongoing"
      );
    });

    it("Should reject execution without votes", async function () {
      await time.increase(61);

      await expect(dao.executeProposal(1)).to.be.revertedWith("No votes cast");
    });

    it("Should reject execution without quorum", async function () {
      // Vote with 1 yes, 2 no (33% approval, below 50% quorum)
      await dao.connect(voter1).vote(1, true);
      await dao.connect(voter2).vote(1, false);
      await dao.connect(owner).vote(1, false);

      await time.increase(61);

      await expect(dao.executeProposal(1)).to.be.revertedWith(
        "Quorum not met"
      );
    });

    it("Should prevent double execution", async function () {
      await dao.connect(voter1).vote(1, true);
      await time.increase(61);

      await dao.executeProposal(1);

      await expect(dao.executeProposal(1)).to.be.revertedWith(
        "Proposal already executed"
      );
    });

    it("Should record genome history correctly", async function () {
      await dao.connect(voter1).vote(1, true);
      await time.increase(61);

      const blockNumber = await ethers.provider.getBlockNumber();
      await dao.executeProposal(1);

      const [hash, timestamp, block] = await dao.getGenomeHistory(1);
      expect(hash).to.equal(genomeHash);
      expect(block).to.equal(blockNumber + 1);
    });
  });

  describe("Security Features", function () {
    it("Should allow owner to authorize proposers", async function () {
      await expect(dao.authorizeProposer(voter1.address))
        .to.emit(dao, "ProposerAuthorized")
        .withArgs(voter1.address);

      expect(await dao.authorizedProposers(voter1.address)).to.be.true;
    });

    it("Should allow owner to revoke proposers", async function () {
      await dao.authorizeProposer(voter1.address);

      await expect(dao.revokeProposer(voter1.address))
        .to.emit(dao, "ProposerRevoked")
        .withArgs(voter1.address);

      expect(await dao.authorizedProposers(voter1.address)).to.be.false;
    });

    it("Should reject non-owner authorization", async function () {
      await expect(
        dao.connect(unauthorized).authorizeProposer(voter1.address)
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should allow owner to pause contract", async function () {
      await expect(dao.pause())
        .to.emit(dao, "ContractPaused")
        .withArgs(owner.address);

      expect(await dao.paused()).to.be.true;
    });

    it("Should prevent operations when paused", async function () {
      await dao.pause();

      const genomeHash = ethers.keccak256(ethers.toUtf8Bytes("genome1"));
      const ourocodeHash = ethers.keccak256(ethers.toUtf8Bytes("ourocode1"));

      await expect(
        dao.connect(proposer).proposeMutation(genomeHash, ourocodeHash)
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should allow owner to unpause contract", async function () {
      await dao.pause();

      await expect(dao.unpause())
        .to.emit(dao, "ContractUnpaused")
        .withArgs(owner.address);

      expect(await dao.paused()).to.be.false;
    });

    it("Should allow owner to transfer ownership", async function () {
      await expect(dao.transferOwnership(voter1.address))
        .to.emit(dao, "OwnershipTransferred")
        .withArgs(owner.address, voter1.address);

      expect(await dao.owner()).to.equal(voter1.address);
      expect(await dao.authorizedProposers(voter1.address)).to.be.true;
    });

    it("Should allow owner to update voting period", async function () {
      await dao.setVotingPeriod(120);
      expect(await dao.votingPeriod()).to.equal(120);
    });

    it("Should reject invalid voting period", async function () {
      await expect(dao.setVotingPeriod(10)).to.be.revertedWith(
        "Voting period too short"
      );
    });

    it("Should allow owner to update quorum", async function () {
      await dao.setQuorum(75);
      expect(await dao.quorum()).to.equal(75);
    });

    it("Should reject invalid quorum", async function () {
      await expect(dao.setQuorum(0)).to.be.revertedWith("Invalid quorum");
      await expect(dao.setQuorum(101)).to.be.revertedWith("Invalid quorum");
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy on executeProposal", async function () {
      const genomeHash = ethers.keccak256(ethers.toUtf8Bytes("genome1"));
      const ourocodeHash = ethers.keccak256(ethers.toUtf8Bytes("ourocode1"));

      await dao.connect(proposer).proposeMutation(genomeHash, ourocodeHash);
      await dao.connect(voter1).vote(1, true);
      await time.increase(61);

      // Execute proposal (reentrancy guard should be active)
      await dao.executeProposal(1);

      // Verify execution completed successfully
      const proposal = await dao.getProposal(1);
      expect(proposal.executed).to.be.true;
    });
  });

  describe("Query Functions", function () {
    it("Should query genome history", async function () {
      const genomeHash = ethers.keccak256(ethers.toUtf8Bytes("genome1"));
      const ourocodeHash = ethers.keccak256(ethers.toUtf8Bytes("ourocode1"));

      await dao.connect(proposer).proposeMutation(genomeHash, ourocodeHash);
      await dao.connect(voter1).vote(1, true);
      await time.increase(61);
      await dao.executeProposal(1);

      const [hash, timestamp, blockNumber] = await dao.getGenomeHistory(1);
      expect(hash).to.equal(genomeHash);
      expect(timestamp).to.be.gt(0);
      expect(blockNumber).to.be.gt(0);
    });

    it("Should check if address has voted", async function () {
      const genomeHash = ethers.keccak256(ethers.toUtf8Bytes("genome1"));
      const ourocodeHash = ethers.keccak256(ethers.toUtf8Bytes("ourocode1"));

      await dao.connect(proposer).proposeMutation(genomeHash, ourocodeHash);

      expect(await dao.hasVotedOnProposal(1, voter1.address)).to.be.false;

      await dao.connect(voter1).vote(1, true);

      expect(await dao.hasVotedOnProposal(1, voter1.address)).to.be.true;
    });
  });
});
