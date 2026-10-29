const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    addUser,
    getUserByEmail,
    getUserProfile,
    updateProfile,
    addAddress,
    deleteAddress
} = require('../controller/user-controller');
const { authenticate } = require('../middlewares/auth-middleware');
const { authorize } = require('../middlewares/role-middleware');

router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/addresses', authenticate, addAddress);
router.delete('/addresses/:addressId', authenticate, deleteAddress);
router.get('/:email', authenticate, getUserByEmail);

router.post('/', addUser('customer'));
router.post('/add-admin', authenticate, authorize('admin'), addUser('admin'));

module.exports = router;
