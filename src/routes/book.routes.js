import {Router} from 'express'
import {bookName , searchComplex , priceRange ,getBooksIssuedToPerson,getBooksIssuedInDateRange } from "../controllers/book.controller.js"


const router = Router()

router.route('/search').get(bookName);
router.route('/rent').get(priceRange)
router.route('/filter').get(searchComplex)
router.route('/issued').get(getBooksIssuedToPerson)
router.route('/issued-range').get(getBooksIssuedInDateRange)

export default router;