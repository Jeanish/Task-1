import express from "express";  
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public")) //public is only folder name
app.use(cookieParser()); 

import bookRoutes from './routes/book.routes.js'
import transactionRoutes from './routes/transaction.routes.js'
import userRoutes from './routes/users.router.js'

app.get('/', (req, res) => {
    res.send('Welcome to your deployed app!');
});

app.use('/api/v1/book',bookRoutes)
app.use('/api/v1/transaction',transactionRoutes)
app.use('/api/v1/user',userRoutes)

export {app}