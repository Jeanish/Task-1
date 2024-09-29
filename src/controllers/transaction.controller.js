import express from "express";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Book } from "../models/books.models.js";
import {Transaction} from "../models/transaction.models.js"
import {User} from "../models/users.models.js"

const transactionIssue = asyncHandler(async(req,res)=>{
    const { bookName, userId, issueDate } = req.body;
   console.log('User ID:', userId); 
    // Log the user ID being used
    // console.log(issueDate);
    
  try {
    console.log("hi");
    
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404 , 'User not found');
    }
    console.log(user);
    
    const book = await Book.findOne({ bookName });
    if (!book) {
        throw new ApiError(404,'Book not found');
    }
    console.log(book);
    console.log("Book ID:", book._id);
    console.log("User ID:", user._id);
    console.log("Issue Date:", new Date(issueDate));

    const transaction = new Transaction({
      bookId: book._id,
      userId: user._id,
      issueDate: new Date(issueDate),
      status: 'issued'
    });
    console.log(transaction);
    
    await transaction.save();
    return res
    .status(201).json(new ApiResponse(201, transaction, 'Book issued successfully'));
  } catch (error) {
    console.error('Error details:', error.message || error);

    throw new ApiError(error, 'Error issuing book', 500);
  }
})

const returnBook = asyncHandler(async(req,res)=>{
    const { bookName, userId, returnDate } = req.body;

  try {

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404 , 'User details is not proper');
    }

    const book = await Book.findOne({ bookName });
    console.log(`book : ${book}`);
    
    if (!book) {
        throw new ApiError(404,'Book details is not found');
    }

    // console.log('Return Date:', returnDate); // Log the incoming returnDate
    console.log(`book rent : ${book.rentPerDay}` );
    
    const transaction = await Transaction.findOne({ bookId: book._id, userId, status: 'issued' });
    if (!transaction) {
      throw new ApiError(404 , 'No active transaction found for this book');
    }
    
    const issueDate = transaction.issueDate;
    const returnDateObj = new Date(returnDate);
    // console.log(returnDateObj - issueDate);
    
    const rentDays = Math.ceil((returnDateObj - issueDate) / (1000 * 60 * 60 * 24));
    console.log(rentDays);
    
    const dailyRent = book.rentPerDay || 0;

    const rentCost = rentDays * dailyRent;
    console.log(rentCost);
    
    transaction.returnDate = returnDateObj;
    transaction.status = 'returned';
    transaction.rentCost = rentCost;
    
    // console.log('Updated Transaction:', transaction);
    await transaction.save();

    const responseTransaction = {
        bookId: transaction.bookId,
        userId: transaction.userId,
        issueDate: transaction.issueDate,
        returnDate: transaction.returnDate,
        rentCost: transaction.rentCost,
        status: transaction.status
    };
    console.log(responseTransaction);
    
    return res
    .status(200)
    .json(new ApiResponse(200, responseTransaction, 'Book returned successfully'));

  } catch (error) {
    console.log(error.message);
    
    throw new ApiError(res, 'Error returning book', 500);
  }
});

const transactionOnThisBook = asyncHandler(async(req,res)=>{
    const { bookName } = req.params;
    console.log(bookName);
    
    if (!bookName) {
        throw new ApiError(404,'Book name should not be empty');
    }

    try {
        const book = await Book.findOne({ bookName });
        if (!book) {
            throw new ApiError(404,'Book details is not found');
        }
        const transactions = await Transaction.find({ bookId:book._id }).populate('userId', 'name email');
        
        if (transactions.length === 0) {
            throw new ApiResponse(201, [], 'No transactions found for this book.');
        }
    
        // Get a list of all User who have issued the book in the past
        const issuedUser = transactions.map(transaction => ({
          userId: transaction.userId._id,
          name: transaction.userId.name,
          email: transaction.userId.email,
          issueDate: transaction.issueDate,
          returnDate: transaction.returnDate
        }));
    
        // Get the total count of people who issued the book
        const totalIssuedCount = issuedUser.length;
    
        // Find if the book is currently issued (no return date)
        const currentlyIssued = transactions.find(transaction => !transaction.returnDate);
    
        const response = {
          totalIssuedCount,
          issuedUser,
          currentlyIssued: currentlyIssued
            ? {
                userId: currentlyIssued.userId._id,
                name: currentlyIssued.userId.name,
                email: currentlyIssued.userId.email,
                issueDate: currentlyIssued.issueDate
              }
            : 'Not issued at the moment'
        };
        return res.status(200).json(new ApiResponse(response))
        
      } catch (error) {
        console.log(error.message);
        
        throw new ApiError(res, 'Error fetching transactions for the book');
      }
})

const totalRentByBook = asyncHandler(async(req,res)=>{
    const { bookName } = req.params;
    
    if (!bookName) {
        throw new ApiError(404,'Book name should not be empty');
    }

    try {

        const book = await Book.findOne({ bookName: new RegExp(bookName, 'i') }).lean();
        if (!book) {
        throw new ApiError(res, 'Book not found', 404);
        }
        // console.log(book._id);
        
        const transactions = await Transaction.find({ bookId: book._id, rentCost: { $gt: 0 } }).lean();
        
        // console.log(transactions);
        
        if (transactions.length === 0) {
          return res.status(200).json(new ApiResponse(200, { totalRent: 0 }, 'No rent data for this book.'));
        }

    const totalRent = transactions.reduce((acc, curr) => acc + curr.rentCost, 0);
    console.log(totalRent);
    
    return res.status(200).json(new ApiResponse(200, { bookName: book.name, totalRent }));
  } catch (error) {
    console.error('Error fetching rent data', error.message);
    throw new ApiError(res, 'Internal server error');
  }
})







export {
    transactionIssue,
    totalRentByBook,transactionOnThisBook,returnBook
}