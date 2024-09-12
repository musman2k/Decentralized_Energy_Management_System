// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract DEMS {
    address public masterSLEC;

    struct Participant {
        bool isRegistered;
    }

    struct Offer {
        uint256 offerID;
        address seller;
        uint256 amount;
        uint256 price;
        bool isActive;
        uint256 biddingDeadline;
        uint256 energyTransTime;
        bool transactionInProgress;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        bool isActive;
        uint256 energyTransTime;
    }

    mapping(address => Participant) public participants;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Bid[]) public bids;
    mapping(address => uint256) public pendingWithdrawals;
    uint256 public offerCount = 0;

    // Events
    event ParticipantRegistered(address participant);
    event OfferCreated(uint256 offerId, address seller, uint256 amount, uint256 price);
    event OfferCancelled(uint256 offerId);
    event BidPlaced(uint256 offerId, address bidder, uint256 amount);
    event BidWithdrawn(uint256 offerId, address bidder, uint256 amount);
    event WinnerChosen(uint256 offerId, address winner);
    event TransactionCompleted(uint256 offerId, address seller, address buyer);
    event OfferPurchased(uint256 offerId, address buyer, address seller, uint256 amount, uint256 price);
    event FundsWithdrawn(address withdrawer, uint256 amount);

    constructor() {
        masterSLEC = msg.sender;
    }

    modifier onlyRegistered() {
        require(participants[msg.sender].isRegistered, "Participant not registered");
        _;
    }

    function register() public {
        require(!participants[msg.sender].isRegistered, "Participant already registered");
        participants[msg.sender] = Participant(true);
        emit ParticipantRegistered(msg.sender);
    }

    function offerEnergyCreation(uint256 _amount, uint256 _price, uint256 _biddingDeadline, uint256 _energyTransTime) public onlyRegistered returns (uint256) {
        Offer storage offer = offers[offerCount];
        uint256 _biddingDeadlineinSeconds = _biddingDeadline * 3600;
        uint256 _energyTransTimeinSeconds = _energyTransTime * 3600;
        require(_biddingDeadlineinSeconds + block.timestamp > block.timestamp, "The Bidding Deadline Should be an hour later in the future.");
        require(_amount > 0 && _price > 0, "Amount and price must be greater than zero");
        offer.offerID = offerCount;
        offer.seller = msg.sender;
        offer.amount = _amount;
        offer.price = _price;
        offer.biddingDeadline = _biddingDeadlineinSeconds + block.timestamp;
        offer.energyTransTime = _energyTransTimeinSeconds + block.timestamp;
        offer.isActive = true;
        
        offerCount++;

        offers[offerCount] = Offer(
            offer.offerID,
            msg.sender,         
            _amount,             
            _price,              
            true,                
            _biddingDeadline,    
            _energyTransTime,    
            false
        );
        emit OfferCreated(offerCount, msg.sender, _amount, _price);

        return offerCount;
    }

    function cancelOffer(uint256 offerId) public {
        require(offers[offerId].seller == msg.sender, "Only seller of the offer can cancel the offer");
        require(offers[offerId].isActive, "Offer is not active cancel offer");
        require(!offers[offerId].transactionInProgress, "Cannot cancel the offer, transaction is in progress");
        offers[offerId].isActive = false;
        emit OfferCancelled(offerId);
    }

    function bidToOffer(uint256 offerId, uint256 _amount) public payable onlyRegistered {
        require(offers[offerId].isActive, "Offer is not active bid to offer");
        require(_amount >= offers[offerId].price, "Insufficient amount sent");
        require(offers[offerId].seller != msg.sender, "Seller can not place the Bid on their own offer");
        require(block.timestamp <= offers[offerId].biddingDeadline, "Bidding is not available anymore");
        bids[offerId].push(Bid(payable(msg.sender), _amount, true, block.timestamp));
        pendingWithdrawals[msg.sender] += _amount;

        emit BidPlaced(offerId, msg.sender, _amount);
    }

    function getBids(uint256 offerId) public view returns (Bid[] memory) {
        require(offerId < offerCount, "Offer does not exist");
        return bids[offerId];
    }

    function withdrawBid(uint256 offerId) public {
        require(offers[offerId].biddingDeadline > block.timestamp, "The Withdrawal time has ended.");
        require(!offers[offerId].transactionInProgress, "Unable to Withdraw bid. Tranation on Progress. ");
        for (uint256 i = 0; i < bids[offerId].length; i++) {
            if (bids[offerId][i].bidder == msg.sender && bids[offerId][i].isActive) {
                uint256 bidAmount = bids[offerId][i].amount;
                bids[offerId][i].isActive = false;
                pendingWithdrawals[msg.sender] -= bidAmount;
                payable(msg.sender).transfer(bidAmount);
                emit BidWithdrawn(offerId, msg.sender, bidAmount);
                break;
                
            }
        }

    }

    function acceptHighestBid(uint256 offerId) public {
        require(offers[offerId].seller == msg.sender, "Only seller can accept bids");
        require(offers[offerId].isActive, "Offer is not active");
        require(block.timestamp < offers[offerId].biddingDeadline, "Bidding deadline has passed away.");
        Bid memory highestBid;
        uint256 highestBidIndex;
        bool bidFound = false;

        for (uint256 i = 0; i < bids[offerId].length; i++) {
            if (bids[offerId][i].amount > highestBid.amount && bids[offerId][i].isActive) {
                highestBid = bids[offerId][i];
                highestBidIndex = i;
                bidFound = true;
            }
        }

        require(bidFound, "No valid bids");

        offers[offerId].isActive = false;
        offers[offerId].transactionInProgress = true;

        for (uint256 i = 0; i < bids[offerId].length; i++) {
            if (i != highestBidIndex) {
                bids[offerId][i].isActive = false;
            }
        }

        emit WinnerChosen(offerId, highestBid.bidder);
    }

    function checkAndCompleteTransaction(uint256 offerId) public {
        Offer storage offer = offers[offerId];
        require(offer.transactionInProgress, "Transaction is not in progress");
        require(offer.energyTransTime <= block.timestamp, "Energy transfer time has not been reached");

        finalizeTransaction(offerId);
    }

    function finalizeTransaction(uint256 offerId) internal {
        Offer storage offer = offers[offerId];
        require(offer.transactionInProgress, "No transaction is in progress");
        
        address seller = offer.seller;
        Bid memory winningBid;

        for (uint256 i = 0; i < bids[offerId].length; i++) {
            if (bids[offerId][i].isActive) {
                winningBid = bids[offerId][i];
                pendingWithdrawals[seller] += winningBid.amount;
                pendingWithdrawals[winningBid.bidder] -= winningBid.amount;
                break;
            }
        }

        offer.transactionInProgress = false;
        emit TransactionCompleted(offerId, offer.seller, winningBid.bidder);
    }


    function withdrawFunds() public {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit FundsWithdrawn(msg.sender, amount);
    }
}