const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(token, "secret")
        req.userData = decoded
        if(decoded.role == "Admin"){
            next()
        }
        else {
            return res.status(401).json({
                message: "Auth failed, require admin"
            })
        }
    } catch (err) {
        return res.status(401).json({
            message: "Auth failed"
        })
    }
}