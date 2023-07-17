const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next)=>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).json("A Token Is Required For Authentication")
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);   
        req.user = decoded;
    } catch (err) {
        err.status = 401;
        next(err)
        // return res.status(401).send("Invalid Token");
    }
    return next();
}

module.exports = verifyToken;