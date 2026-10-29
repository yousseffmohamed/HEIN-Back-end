const Payment = require('../model/payment-model');
const Order = require('../model/order-model');

exports.createPayment = async (req, res) => {
    try {
        const { orderId, amount, currency = 'EGP', paymentMethod = 'cash' } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();

        const payment = await Payment.create({
            user: req.user._id,
            order: orderId,
            amount: amount || order.total,
            currency,
            paymentMethod,
            status: paymentMethod === 'cash' ? 'pending' : 'completed',
            transactionId
        });

        order.payment.push(payment._id);
        await order.save();

        res.status(201).json({ message: 'Payment recorded', data: payment });
    } catch (error) {
        res.status(500).json({ message: 'Payment failed', error: error.message });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'firstName lastName email')
            .populate('order', 'total orderStatus')
            .sort({ createdAt: -1 });
        res.status(200).json({ message: 'All payments', data: payments });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
    }
};

exports.getPaymentByOrder = async (req, res) => {
    try {
        const payments = await Payment.find({ order: req.params.orderId });
        res.status(200).json({ data: payments });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["completed", "refunded", "failed", "cancelled", "pending"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        res.status(200).json({ message: 'Payment status updated', data: payment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update payment status', error: error.message });
    }
};
