const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} = require('../controller/order-controller');
const { authenticate } = require('../middlewares/auth-middleware');
const { authorize } = require('../middlewares/role-middleware');

router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);

router.get('/', authenticate, authorize('admin'), getAllOrders);
router.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);

module.exports = router;
