// import library
const express = require('express')
const { Mongoose } = require('mongoose')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const requireAdmin = require('../middleware/require-admin')

// login
router.post('/login', (req, res, next) => {
    User.findOne({ username: req.body.username })
        .exec()
        .then(user => {
            if (user < 1){
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err){
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                }
                if (result){
                    const token = jwt.sign({
                        id: user._id,
                        username: user.username,
                        role: user.role
                    }, "secret", {expiresIn: "1h"})
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    })
                }
                return res.status(401).json({
                    message: 'Auth failed'
                })
            })
        })
        .catch(err => {
            res.status(500).json({ message: err.message })
        })
})

// show login user info
router.get('/', async (req, res) => {
    let user
    try {
        const token = req.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(token, "secret")
        req.userData = decoded
        try{
            user = await User.findById(decoded.id)
            if (user == null){
                return res.status(404).json({ message: 'Data tidak ditemukan...' })
            }
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    
        res.user = user
        res.json(res.user)
    } catch (err) {
        return res.status(401).json({
            message: "Auth failed"
        })
    }
})

// get all users
router.get('/all', requireAdmin, async (req, res) => {
    try{
        const users = await User.find()
        res.json(users)
    } catch (err){
        res.status(500).json({message: err.message})
    }
})

// create a user
router.post('/create', requireAdmin,(req, res) => {
    User.findOne({ username: req.body.username })
        .exec()
        .then(user => {
            if (user) {
                return res.status(409).json({ message: 'Username sudah ada!' })
            } else {
                bcrypt.hash(req.body.password, 10, async (err, hash) => {
                    if (err){
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            username: req.body.username,
                            password: hash
                        })
                        try{
                            await user.save()
                            res.json({ message: 'Berhasil membuat user...' })
                        } catch (err) {
                            res.status(500).json({ message: err.message })
                        }
                    }
                })
            }
        })
})

// find one user
router.get('/:id', requireAdmin, getUser, (req, res) => {
    res.json(res.user)
})

// update a user
router.patch('/:id', requireAdmin, getUser, async (req, res) => {
    if(req.body.username != null){
        res.user.username = req.body.username
    }
    if(req.body.password != null){
        res.user.password = req.body.password
    }
    if(req.body.role != null){
        res.user.role = req.body.role
    }
    try {
        const updateUser = await res.user.save()
        res.json(updateUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// delete a user
router.delete('/:id', requireAdmin, getUser, async (req, res) => {
    try{
        await res.user.remove()
        res.json({ message: 'Berhasil menghapus user...' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

async function getUser(req, res, next){
    let user
    try{
        user = await User.findById(req.params.id)
        if (user == null){
            return res.status(404).json({ message: 'Data tidak ditemukan...' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.user = user
    next()
}

module.exports = router 