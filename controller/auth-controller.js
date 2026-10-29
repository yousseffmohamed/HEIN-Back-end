const User = require('../model/user-model');
const jwt = require('jsonwebtoken');

const signInToken = (myUser) => {
    const {_id, firstName, lastName, role, email} = myUser;

    return jwt.sign({_id, firstName, lastName, role, email},
        process.env.SECRET_KEY,
        {expiresIn: process.env.JWT_EXPIRES_IN || '1d'}
    );
};

exports.login = async (req, res) => {
    const {email, passwordHash, password} = req.body;
    const inputPassword = password || passwordHash;

    if (!email || !inputPassword) {
        return res.status(400).json({message: 'Email and password are required'});
    }

    const myUser = await User.findOne({email});

    if (!myUser) {
        return res.status(401).json({message: 'Invalid email or password'});
    }

    if (await myUser.isCorrectPassword(inputPassword)) {
        const token = signInToken(myUser);
        return res.status(200).json({
            message: 'Logged in Successfully',
            data: {
                token,
                user: {
                    _id: myUser._id,
                    firstName: myUser.firstName,
                    lastName: myUser.lastName,
                    email: myUser.email,
                    role: myUser.role
                }
            }
        });
    }

    return res.status(401).json({message: 'Invalid email or password, try again'});
};
