const express = require('express');
const router = express.Router();
const {
    getProductReviews,
    createReview,
    getAllReviews,
    updateReviewStatus,
    deleteReview
} = require('../controller/review-controller');
const { authenticate } = require('../middlewares/auth-middleware');
const { authorize } = require('../middlewares/role-middleware');

router.get('/product/:productId', getProductReviews);

router.post('/', authenticate, createReview);

router.get('/all', authenticate, authorize('admin'), getAllReviews);
router.patch('/:id/status', authenticate, authorize('admin'), updateReviewStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteReview);

module.exports = router;
