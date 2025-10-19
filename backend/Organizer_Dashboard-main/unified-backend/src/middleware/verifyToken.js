const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    
    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.error("JWT verification error:", err.message);
            return res.status(403).json({ message: "Invalid token." });
        }

        req.user = decoded; // Attach decoded payload to request
        next();
    });
};

module.exports = verifyToken;