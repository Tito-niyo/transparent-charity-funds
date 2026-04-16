// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TransparentCharityFund is ReentrancyGuard {
    struct Expense {
        uint256 id;
        string description;
        uint256 amount;
        address payable recipient;
        bool paid;
        uint256 timestamp;
    }

    address public immutable admin;
    uint256 public totalDonated;
    uint256 public totalSpent;

    Expense[] private expenses;
    mapping(address => uint256) public donationsByAddress;

    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    event ExpenseCreated(
        uint256 indexed expenseId,
        string description,
        uint256 amount,
        address indexed recipient,
        uint256 timestamp
    );
    event ExpensePaid(uint256 indexed expenseId, address indexed recipient, uint256 amount, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor(address initialAdmin) {
        require(initialAdmin != address(0), "Invalid admin address");
        admin = initialAdmin;
    }

    function donate() external payable {
        require(msg.value > 0, "Donation amount must be greater than 0");

        donationsByAddress[msg.sender] += msg.value;
        totalDonated += msg.value;

        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }

    function createExpense(
        string calldata description,
        uint256 amount,
        address payable recipient
    ) external onlyAdmin returns (uint256) {
        require(bytes(description).length > 0, "Description is required");
        require(amount > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient address");

        uint256 expenseId = expenses.length;
        expenses.push(
            Expense({
                id: expenseId,
                description: description,
                amount: amount,
                recipient: recipient,
                paid: false,
                timestamp: block.timestamp
            })
        );

        emit ExpenseCreated(expenseId, description, amount, recipient, block.timestamp);
        return expenseId;
    }

    function payExpense(uint256 expenseId) external onlyAdmin nonReentrant {
        require(expenseId < expenses.length, "Expense does not exist");

        Expense storage expense = expenses[expenseId];
        require(!expense.paid, "Expense already paid");
        require(address(this).balance >= expense.amount, "Insufficient contract balance");

        expense.paid = true;
        totalSpent += expense.amount;

        (bool success, ) = expense.recipient.call{value: expense.amount}("");
        require(success, "Transfer failed");

        emit ExpensePaid(expenseId, expense.recipient, expense.amount, block.timestamp);
    }

    function getExpense(uint256 expenseId) external view returns (Expense memory) {
        require(expenseId < expenses.length, "Expense does not exist");
        return expenses[expenseId];
    }

    function getAllExpenses() external view returns (Expense[] memory) {
        return expenses;
    }

    function expenseCount() external view returns (uint256) {
        return expenses.length;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
