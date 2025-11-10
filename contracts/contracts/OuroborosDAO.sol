// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OuroborosDAO
 * @dev Decentralized governance contract for organism mutation approval
 * Implements proposal creation, voting, execution, and genome history tracking
 * Includes security features: reentrancy guard, access control, pause mechanism
 */
contract OuroborosDAO {
    // Security state
    address public owner;
    bool private locked;
    bool public paused;
    mapping(address => bool) public authorizedProposers;
    // Proposal structure with genome hash and voting fields
    struct Proposal {
        uint256 id;
        bytes32 genomeHash;
        bytes32 ourocodeHash;
        address proposer;
        uint256 createdAt;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
    }
    
    // Genome record for immutable evolutionary history
    struct GenomeRecord {
        bytes32 hash;
        uint256 generation;
        uint256 timestamp;
        uint256 blockNumber;
    }
    
    // Storage
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => GenomeRecord) public genomeHistory;
    
    uint256 public proposalCount;
    uint256 public currentGeneration;
    uint256 public votingPeriod = 60; // seconds
    uint256 public quorum = 50; // 50% threshold
    
    // Events
    event ProposalCreated(
        uint256 indexed id,
        bytes32 genomeHash,
        bytes32 ourocodeHash,
        address proposer,
        uint256 createdAt
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votesFor,
        uint256 votesAgainst
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        bytes32 genomeHash,
        uint256 generation
    );
    
    event GenomeRecorded(
        uint256 indexed generation,
        bytes32 hash,
        uint256 blockNumber,
        uint256 timestamp
    );
    
    event ProposerAuthorized(address indexed proposer);
    event ProposerRevoked(address indexed proposer);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Modifiers
    
    /**
     * @dev Reentrancy guard modifier
     */
    modifier noReentrant() {
        require(!locked, "No reentrancy allowed");
        locked = true;
        _;
        locked = false;
    }
    
    /**
     * @dev Access control for owner-only functions
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    /**
     * @dev Access control for authorized proposers
     */
    modifier onlyAuthorized() {
        require(authorizedProposers[msg.sender], "Not authorized to propose");
        _;
    }
    
    /**
     * @dev Pause mechanism check
     */
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    /**
     * @dev Constructor sets deployer as owner and authorizes them
     */
    constructor() {
        owner = msg.sender;
        authorizedProposers[msg.sender] = true;
        locked = false;
        paused = false;
    }
    
    /**
     * @dev Propose a mutation with genome hash and Ourocode hash
     * @param _genomeHash Hash of the proposed organism state
     * @param _ourocodeHash Hash of the compiled Ourocode
     * @return proposalId The ID of the created proposal
     */
    function proposeMutation(bytes32 _genomeHash, bytes32 _ourocodeHash) 
        external 
        whenNotPaused
        onlyAuthorized
        returns (uint256) 
    {
        require(_genomeHash != bytes32(0), "Invalid genome hash");
        require(_ourocodeHash != bytes32(0), "Invalid ourocode hash");
        require(validateOurocode(_ourocodeHash), "Ourocode validation failed");
        
        proposalCount++;
        
        Proposal storage p = proposals[proposalCount];
        p.id = proposalCount;
        p.genomeHash = _genomeHash;
        p.ourocodeHash = _ourocodeHash;
        p.proposer = msg.sender;
        p.createdAt = block.timestamp;
        p.votesFor = 0;
        p.votesAgainst = 0;
        p.executed = false;
        
        emit ProposalCreated(
            proposalCount,
            _genomeHash,
            _ourocodeHash,
            msg.sender,
            block.timestamp
        );
        
        return proposalCount;
    }
    
    /**
     * @dev Vote on a proposal with double-vote prevention
     * @param _proposalId The ID of the proposal to vote on
     * @param _support True for yes, false for no
     */
    function vote(uint256 _proposalId, bool _support) external whenNotPaused {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        
        Proposal storage p = proposals[_proposalId];
        
        require(!p.executed, "Proposal already executed");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(block.timestamp < p.createdAt + votingPeriod, "Voting period ended");
        
        // Mark as voted (double-vote prevention)
        hasVoted[_proposalId][msg.sender] = true;
        
        // Record vote
        if (_support) {
            p.votesFor++;
        } else {
            p.votesAgainst++;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, p.votesFor, p.votesAgainst);
    }
    
    /**
     * @dev Execute an approved proposal with quorum checking
     * @param _proposalId The ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) external whenNotPaused noReentrant {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        
        Proposal storage p = proposals[_proposalId];
        
        require(!p.executed, "Proposal already executed");
        require(block.timestamp >= p.createdAt + votingPeriod, "Voting period ongoing");
        
        uint256 totalVotes = p.votesFor + p.votesAgainst;
        require(totalVotes > 0, "No votes cast");
        
        // Check quorum (50% approval)
        uint256 approvalPercentage = (p.votesFor * 100) / totalVotes;
        require(approvalPercentage >= quorum, "Quorum not met");
        
        // Mark as executed
        p.executed = true;
        
        // Record genome in history
        currentGeneration++;
        genomeHistory[currentGeneration] = GenomeRecord({
            hash: p.genomeHash,
            generation: currentGeneration,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        emit ProposalExecuted(_proposalId, p.genomeHash, currentGeneration);
        emit GenomeRecorded(
            currentGeneration,
            p.genomeHash,
            block.number,
            block.timestamp
        );
    }
    
    /**
     * @dev Query genome history by generation
     * @param _generation The generation number to query
     * @return hash The genome hash
     * @return timestamp The timestamp of recording
     * @return blockNumber The block number of recording
     */
    function getGenomeHistory(uint256 _generation) 
        external 
        view 
        returns (bytes32 hash, uint256 timestamp, uint256 blockNumber) 
    {
        require(_generation > 0 && _generation <= currentGeneration, "Invalid generation");
        
        GenomeRecord memory record = genomeHistory[_generation];
        return (record.hash, record.timestamp, record.blockNumber);
    }
    
    /**
     * @dev Validate Ourocode hash (simplified validation)
     * @param _ourocodeHash The Ourocode hash to validate
     * @return valid True if valid, false otherwise
     */
    function validateOurocode(bytes32 _ourocodeHash) 
        public 
        pure 
        returns (bool) 
    {
        // Simplified validation - checks that hash is not zero
        // In production, this would check syntax rules and structure
        return _ourocodeHash != bytes32(0);
    }
    
    /**
     * @dev Get proposal details
     * @param _proposalId The ID of the proposal
     * @return id The proposal ID
     * @return genomeHash The genome hash
     * @return ourocodeHash The OuroCode hash
     * @return proposer The address of the proposer
     * @return createdAt The creation timestamp
     * @return votesFor The number of votes in favor
     * @return votesAgainst The number of votes against
     * @return executed Whether the proposal has been executed
     */
    function getProposal(uint256 _proposalId)
        external
        view
        returns (
            uint256 id,
            bytes32 genomeHash,
            bytes32 ourocodeHash,
            address proposer,
            uint256 createdAt,
            uint256 votesFor,
            uint256 votesAgainst,
            bool executed
        )
    {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        
        Proposal storage p = proposals[_proposalId];
        return (
            p.id,
            p.genomeHash,
            p.ourocodeHash,
            p.proposer,
            p.createdAt,
            p.votesFor,
            p.votesAgainst,
            p.executed
        );
    }
    
    /**
     * @dev Check if an address has voted on a proposal
     * @param _proposalId The proposal ID
     * @param _voter The voter address
     * @return True if voted, false otherwise
     */
    function hasVotedOnProposal(uint256 _proposalId, address _voter)
        external
        view
        returns (bool)
    {
        return hasVoted[_proposalId][_voter];
    }
    
    // Admin Functions (Owner-only)
    
    /**
     * @dev Authorize an address to propose mutations
     * @param _proposer The address to authorize
     */
    function authorizeProposer(address _proposer) external onlyOwner {
        require(_proposer != address(0), "Invalid address");
        require(!authorizedProposers[_proposer], "Already authorized");
        
        authorizedProposers[_proposer] = true;
        emit ProposerAuthorized(_proposer);
    }
    
    /**
     * @dev Revoke authorization from a proposer
     * @param _proposer The address to revoke
     */
    function revokeProposer(address _proposer) external onlyOwner {
        require(authorizedProposers[_proposer], "Not authorized");
        
        authorizedProposers[_proposer] = false;
        emit ProposerRevoked(_proposer);
    }
    
    /**
     * @dev Emergency pause mechanism - stops all mutations
     */
    function pause() external onlyOwner {
        require(!paused, "Already paused");
        paused = true;
        emit ContractPaused(msg.sender);
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        require(paused, "Not paused");
        paused = false;
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @dev Transfer ownership to a new address
     * @param _newOwner The new owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        require(_newOwner != owner, "Already owner");
        
        address previousOwner = owner;
        owner = _newOwner;
        
        // Authorize new owner as proposer
        authorizedProposers[_newOwner] = true;
        
        emit OwnershipTransferred(previousOwner, _newOwner);
    }
    
    /**
     * @dev Update voting period (owner only)
     * @param _newPeriod New voting period in seconds
     */
    function setVotingPeriod(uint256 _newPeriod) external onlyOwner {
        require(_newPeriod >= 30, "Voting period too short");
        require(_newPeriod <= 86400, "Voting period too long");
        votingPeriod = _newPeriod;
    }
    
    /**
     * @dev Update quorum threshold (owner only)
     * @param _newQuorum New quorum percentage (0-100)
     */
    function setQuorum(uint256 _newQuorum) external onlyOwner {
        require(_newQuorum > 0 && _newQuorum <= 100, "Invalid quorum");
        quorum = _newQuorum;
    }
}
