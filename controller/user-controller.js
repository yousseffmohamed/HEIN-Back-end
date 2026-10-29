const User = require('../model/user-model');

exports.getAllUsers = async (req, res) => {
    const myUsers = await User.find().select('-passwordHash');
    res.status(200).json({message: 'All users', data: myUsers});
};

exports.getUserByEmail = async (req, res) => {
    const email = req.params.email;
    const myUser = await User.findOne({email}).select('-passwordHash');
    res.status(200).json({data: myUser});
};

exports.getUserProfile = async (req, res) => {
    try {
        const myUser = await User.findById(req.user._id).select('-passwordHash');
        if (!myUser) {
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({data: myUser});
    } catch (error) {
        res.status(500).json({message: 'Failed to fetch profile', error: error.message});
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.user._id,
            { firstName, lastName, phone },
            { new: true }
        ).select('-passwordHash');
        res.status(200).json({message: 'Profile updated', data: updated});
    } catch (error) {
        res.status(500).json({message: 'Failed to update profile', error: error.message});
    }
};

exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({message: 'User not found'});

        const newAddress = {
            title: req.body.title || 'Home',
            country: req.body.country,
            city: req.body.city,
            street: req.body.street,
            building: req.body.building,
            floor: req.body.floor,
            apartment: req.body.apartment,
            isDefault: req.body.isDefault || false
        };

        if (newAddress.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({message: 'Address added', data: user.addresses});
    } catch (error) {
        res.status(500).json({message: 'Failed to add address', error: error.message});
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({message: 'User not found'});

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
        await user.save();

        res.status(200).json({message: 'Address removed', data: user.addresses});
    } catch (error) {
        res.status(500).json({message: 'Failed to delete address', error: error.message});
    }
};

exports.addUser = (role) => {
    return async (req, res) => {
        try {
            const {firstName, lastName, email, passwordHash, password, phone} = req.body;
            const inputPassword = passwordHash || password;

            if (!email || !inputPassword || !firstName || !lastName) {
                return res.status(400).json({message: 'All fields are required'});
            }

            const existing = await User.findOne({email});
            if (existing) {
                return res.status(400).json({message: 'Email already registered'});
            }

            const myUser = await User.create({
                firstName,
                lastName,
                email,
                phone,
                passwordHash: inputPassword,
                role
            });

            res.status(201).json({
                message: 'User Created',
                data: {
                    _id: myUser._id,
                    firstName: myUser.firstName,
                    lastName: myUser.lastName,
                    email: myUser.email,
                    role: myUser.role
                }
            });
        } catch (error) {
            res.status(500).json({message: 'Registration failed', error: error.message});
        }
    }
};
