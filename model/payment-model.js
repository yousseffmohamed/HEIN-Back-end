const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    currency: {
        type: String,
        required: true,
        enum: ["EGP", "USD", "EUR", "SAR", "AED"]
    },
    paymentMethod: {
        type: String,
        enum: ["visa", "mastercard", "apple-pay", "google-pay", "cash", "wallet"]
    },
    status: {
        type: String,
        enum: ["completed", "refunded", "failed", "cancelled", "pending"],
        default: "pending"
    },
    transactionId: {
        type: String,
        trim: true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Payment', paymentSchema);