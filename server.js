// import library
require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')

// database connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Berhasil terkoneksi ke database...'))

// setup server to accept json
app.use(express.json())

// server routes
const userRouter = require('./routes/users')
app.use('/users', userRouter)


app.listen(process.env.PORT, () => console.log('Memulai server...'))