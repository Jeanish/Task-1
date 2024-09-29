import mongoose,{Schema} from "mongoose";

const transactionSchema = new Schema({

    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
      },
      issueDate: { 
        type: Date, 
        required: true 
      },
      returnDate: { 
        type: Date 
      },
      status: {
        type: String,
        enum: ['issued', 'returned'],
        required: true
      },
      rentCost: {
        type: Number,
        default: 0
      },
},{
    timestamps:true,
})

export const Transaction = mongoose.model('Transaction', transactionSchema);
// module.exports = Transaction;