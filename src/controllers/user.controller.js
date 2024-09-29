import express from "express";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Book } from "../models/books.models.js";
import {User} from "../models/users.models.js"

const getAllUsers = asyncHandler(async (req, res) => {
    try {
      const users = await User.find();
      
      if (!users.length) {
        throw new ApiError(404, 'No users found');
      }
  
      return res
        .status(200)
        .json(new ApiResponse(200, users, 'Users retrieved successfully'));
    } catch (error) {
      throw new ApiError(500, 'Failed to retrieve users');
    }
  });
  

export {
    getAllUsers
}