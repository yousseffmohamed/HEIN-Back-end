const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1
        },
        productPrice: {
            type: Number,
            required: true,
        },
        productMainPic: String
    }],
    totalItems: {
        type: Number,
        required: true,
        min: 1
    },
    subtotal: Number,
    shippingCost: Number,
    discounts: Number,
    total: Number,
    orderStatus: {
        type: String,
        enum: ["placed", "delivered", "cancelled", "preparing", "delivering"],
        default: "placed"
    },
    payment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],
    shippingAddress: {
    country: String,
    city: String,
    street: String,
    building: String,
    floor: String,
    apartment: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Order', orderSchema);