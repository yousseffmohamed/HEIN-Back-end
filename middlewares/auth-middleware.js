const User = require('../model/user-model');
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({error: 'no token provided'});
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = await User.findById(decoded._id);

        if (!req.user) {
            return res.status(404).json({error: 'User Not Found'});
        }

        next();
    } catch (error) {
        return res.status(401).json({error: 'invalid or expired token'});
    }
}