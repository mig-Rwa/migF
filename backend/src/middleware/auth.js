const jwt = require('jsonwebtoken');
const config = require('../config/config');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Please authenticate'
        });
    }
};

module.exports = auth; 