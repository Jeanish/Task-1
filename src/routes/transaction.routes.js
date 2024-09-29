import {Router} from 'express'
import { transactionOnThisBook,returnBook,totalRentByBook,transactionIssue } from '../controllers/transaction.controller.js'

const router = Router()

router.route('/issue').post(transactionIssue)
router.route('/return').post(returnBook)
router.route('/book/:bookName').get(transactionOnThisBook)
router.route('/rent/:bookName').get(totalRentByBook)


export default router;
