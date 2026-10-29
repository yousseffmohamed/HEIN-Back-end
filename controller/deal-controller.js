const Deal = require('../model/deal-model');
const Product = require('../model/product-model');

exports.getActiveDeals = async (req, res) => {
    try {
        const now = new Date();
        const deals = await Deal.find({
            isActive: true,
            endDate: { $gte: now }
        })
        .populate('product')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Active deals retrieved successfully',
            count: deals.length,
            data: deals
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch active deals',
            error: error.message
        });
    }
};

exports.getAllDeals = async (req, res) => {
    try {
        const deals = await Deal.find()
            .populate('product')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'All deals retrieved successfully',
            count: deals.length,
            data: deals
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch deals',
            error: error.message
        });
    }
};

exports.getDealById = async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await Deal.findById(id).populate('product');

        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        return res.status(200).json({ message: 'Deal retrieved', data: deal });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch deal', error: error.message });
    }
};

exports.createDeal = async (req, res) => {
    try {
        const {
            title,
            description,
            productId,
            discountType = 'percentage',
            discountValue,
            startDate,
            endDate,
            banner
        } = req.body;

        if (!title || !productId || discountValue === undefined || !endDate) {
            return res.status(400).json({
                message: 'Title, productId, discountValue, and endDate are required fields'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Associated product not found' });
        }

        const originalPrice = product.price;
        let discountPrice = originalPrice;

        if (discountType === 'percentage') {
            const pct = Math.min(100, Math.max(0, Number(discountValue)));
            discountPrice = Math.round((originalPrice * (100 - pct)) / 100);
        } else {
            discountPrice = Math.max(0, originalPrice - Number(discountValue));
        }

        const start = startDate ? new Date(startDate) : new Date();
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({
                message: 'End date must be after start date'
            });
        }

        const newDeal = await Deal.create({
            title,
            description: description || '',
            product: productId,
            discountType,
            discountValue: Number(discountValue),
            originalPrice,
            discountPrice,
            startDate: start,
            endDate: end,
            isActive: true,
            banner: banner || product.mainPic || ''
        });

        const populated = await newDeal.populate('product');

        return res.status(201).json({
            message: 'Deal created successfully',
            data: populated
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create deal',
            error: error.message
        });
    }
};

exports.updateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.productId) {
            updateData.product = updateData.productId;
            delete updateData.productId;
        }

        const updated = await Deal.findByIdAndUpdate(id, updateData, { new: true }).populate('product');
        if (!updated) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        return res.status(200).json({ message: 'Deal updated successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update deal', error: error.message });
    }
};

exports.deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Deal.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        return res.status(200).json({ message: 'Deal deleted successfully', data: deleted });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete deal', error: error.message });
    }
};
