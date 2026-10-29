const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    department: String,
    category: [String],
    brand: String,
    description: String,
    mainPic: String,
    images: [String],
    slug: {
        type: String,
        unique: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema);
