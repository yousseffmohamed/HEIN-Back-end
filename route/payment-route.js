const express = require('express');
const router = express.Router();
const {
    createPayment,
    getAllPayments,
    getPaymentByOrder,
    updatePaymentStatus
} = require('../controller/payment-controller');
const { authenticate } = require('../middlewares/auth-middleware');
const { authorize } = require('../middlewares/role-middleware');

router.post('/', authenticate, createPayment);
router.get('/order/:orderId', authenticate, getPaymentByOrder);

router.get('/', authenticate, authorize('admin'), getAllPayments);
router.patch('/:id/status', authenticate, authorize('admin'), updatePaymentStatus);

module.exports = router;
