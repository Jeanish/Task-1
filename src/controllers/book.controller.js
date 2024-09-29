import express from "express";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Book } from "../models/books.models.js";
import {User} from "../models/users.models.js"
import { Transaction } from "../models/transaction.models.js";

const getAllBook = asyncHandler(async(req,res)=>{
    const { bookName } = req.body;

    if(!bookName){
        throw new ApiError(
            404,
            "Search item should not be empty"
    )}

    try {
         const books = await Book.find(bookName);

         if (!books.length) {
            return ApiError(404,'No books found matching the search term');
          }
      
          return res.status(200).json(new ApiResponse(200, books, 'Books found'));
  
    } catch (error) {
        throw new ApiError(402, 
            'Failed to search books'
)}
})

const bookName = asyncHandler(async(req,res)=>{
  //term is for book name
    const { term } = req.body;
    console.log(term);
    
    if(!term){
        throw new ApiError(
            404,
            "Search item should not be empty"
    )}
    try {
        const books = await Book.find({ bookName: new RegExp(term, 'i') });
    
        if (!books.length) {
          return ApiError(res, 'No books found matching the search term', 404);
        }
    
        return res.status(200).json(new ApiResponse(200, books, 'Books found'));
      } catch (error) {
        throw new ApiError(402, 
            'Failed to search books'
        )}
})

const priceRange = asyncHandler(async(req,res)=>{

    const {minRent , maxRent } = req.body;
    
    if (!minRent || !maxRent) {
        throw new ApiError(400, 'Please provide both minRent and maxRent values');
    }

    try {
        const books = await Book.find({ 
            rentPerDay: { 
                $gte: minRent, $lte: maxRent 
            } 
        });

        if (!books.length) {
            throw new ApiError(404, 'No books found in the given rent range');
        }

        return res
        .status(201)
        .json(new ApiResponse(200, books,"Fetching of books in given price range is successfully !!"));

      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
      }

})

const searchComplex = asyncHandler(async(req,res)=>{
    const { category, term, minRent, maxRent } = req.query;


  console.log(category,term);
  
  if (!category || !term || !minRent || !maxRent) {
    throw new ApiError(400, 'Please provide category, search term, minRent, and maxRent');
  }

  try {
    const books = await Book.find({
      category: category,
      bookName: new RegExp(term, 'i'), 
      rentPerDay: { $gte: Number(minRent), $lte: Number(maxRent) }
    });

    if (!books.length) {
        throw new ApiError(404, 'No books found matching the criteria');
    }

    return res
    .status(200)
    .json(new ApiResponse(200,books, 'Books found matching the criteria'));
  } catch (error) {
    throw new ApiError(403,'Failed to fetch books by category, term, and rent range');
  }
})

const getBooksIssuedToPerson = asyncHandler(async (req, res) => {
  const { userId, name } = req.query;

  try {
    if (!userId && !name) {
      throw new ApiError(400,'User ID or name must be provided')
    }

    let user;
  if (userId) {
      user = await User.findById(userId);
    } else if (name) {
      user = await User.findOne({ name: new RegExp(name, 'i') });
    }

    if (!user) {
      throw new ApiError(404,'User not found')
    }

    const transactions = await Transaction.find({
      userId: user._id,
      status: 'issued'
    }).populate('bookId', 'bookName');

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No books currently issued to ${user.name}`,
        data: []
      });
    }

    const issuedBooks = transactions.map(transaction => ({
      bookName: transaction.bookId.bookName,
      issueDate: transaction.issueDate,
      rentCost: transaction.rentCost
    }));

    return res.status(200).json({
      success: true,
      message: `Books issued to ${user.name}`,
      data: issuedBooks
    });

  } catch (error) {
    console.error('Error fetching books for the user:', error.message);
    throw new ApiError(500,'Internal server error')
  }
});

const getBooksIssuedInDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    if (!startDate || !endDate) {
      throw new ApiError(400,'Start date and end date must be provided');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(402,'Invalid data format')
    }

    const transactions = await Transaction.find({
      issueDate: { $gte: start, $lte: end },
      status: 'issued'
    })
      .populate('bookId', 'bookName')
      .populate('userId', 'name email');

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No books issued between ${startDate} and ${endDate}`,
        data: []
      });
    }

    const booksIssued = transactions.map(transaction => ({
      bookName: transaction.bookId.bookName,
      userName: transaction.userId.name,
      userEmail: transaction.userId.email,
      issueDate: transaction.issueDate,
      rentCost: transaction.rentCost
    }));

    return res.status(200).json({
      success: true,
      message: `Books issued between ${startDate} and ${endDate}`,
      data: booksIssued
    });

  } catch (error) {
    console.error('Error fetching books within date range:', error.message);
    throw new ApiError(500,'Internal server error');
  }
});


export {
   getAllBook, bookName , searchComplex , priceRange ,getBooksIssuedToPerson ,getBooksIssuedInDateRange
}