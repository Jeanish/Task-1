import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema({
    bookName : {
        type: String,
        required: true,
        unique: true, 
    },
    category:{
        type:String,
        required:true,
    },
    rentPerDay:{
        type:Number,
        required: true,
    },   
},{
    timestamps:true,
})

export const Book = mongoose.model("Book", bookSchema);
