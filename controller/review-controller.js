const Review = require('../model/review-model');
const Product = require('../model/product-model');

exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({
            product: productId,
            status: 'published'
        })
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        let averageRating = 5.0;

        if (totalReviews > 0) {
            const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
            averageRating = parseFloat((sum / totalReviews).toFixed(1));
        }

        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const star = Math.round(r.rating);
            if (ratingCounts[star] !== undefined) {
                ratingCounts[star]++;
            }
        });

        return res.status(200).json({
            message: 'Product reviews retrieved successfully',
            count: totalReviews,
            averageRating,
            ratingCounts,
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch product reviews',
            error: error.message
        });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required to post a review' });
        }

        if (!productId || rating === undefined || !comment) {
            return res.status(400).json({
                message: 'productId, rating (1-5), and comment are required fields'
            });
        }

        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({
                message: 'Rating must be a valid number between 1 and 5'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const newReview = await Review.create({
            user: userId,
            product: productId,
            rating: numRating,
            comment: comment.trim(),
            status: 'published'
        });

        const populated = await newReview.populate('user', 'firstName lastName email');

        return res.status(201).json({
            message: 'Review posted successfully',
            data: populated
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to submit review',
            error: error.message
        });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'firstName lastName email')
            .populate('product', 'name slug mainPic')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'All reviews retrieved successfully',
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

exports.updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowed = ['published', 'pending', 'flagged'];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${allowed.join(', ')}`
            });
        }

        const updated = await Review.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )
        .populate('user', 'firstName lastName email')
        .populate('product', 'name slug mainPic');

        if (!updated) {
            return res.status(404).json({ message: 'Review not found' });
        }

        return res.status(200).json({
            message: 'Review status updated successfully',
            data: updated
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update review status',
            error: error.message
        });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Review.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Review not found' });
        }

        return res.status(200).json({
            message: 'Review deleted successfully',
            data: deleted
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete review',
            error: error.message
        });
    }
};
