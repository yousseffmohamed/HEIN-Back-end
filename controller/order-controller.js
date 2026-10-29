const Order = require('../model/order-model');
const Product = require('../model/product-model');

exports.createOrder = async (req, res) => {
    try {
        const { products, shippingAddress, shippingCost = 50, discounts = 0 } = req.body;

        if (!products || !products.length) {
            return res.status(400).json({ message: 'Cart products are required to place an order' });
        }

        let calculatedSubtotal = 0;
        let totalItems = 0;
        const verifiedProducts = [];

        for (const item of products) {
            const dbProduct = await Product.findById(item.product);
            if (!dbProduct) {
                return res.status(404).json({ message: `Product not found: ${item.productName || item.product}` });
            }

            const qty = Number(item.quantity) || 1;
            const price = dbProduct.price;
            calculatedSubtotal += price * qty;
            totalItems += qty;

            verifiedProducts.push({
                product: dbProduct._id,
                productName: dbProduct.name,
                quantity: qty,
                productPrice: price,
                productMainPic: dbProduct.mainPic
            });
        }

        const total = calculatedSubtotal + shippingCost - discounts;

        const order = await Order.create({
            user: req.user._id,
            products: verifiedProducts,
            totalItems,
            subtotal: calculatedSubtotal,
            shippingCost,
            discounts,
            total,
            shippingAddress,
            orderStatus: 'placed'
        });

        res.status(201).json({ message: 'Order created successfully', data: order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ message: 'My Orders', data: orders });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.status(200).json({ data: order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.status(200).json({ message: 'All orders', data: orders });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const validStatuses = ["placed", "delivered", "cancelled", "preparing", "delivering"];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
};
