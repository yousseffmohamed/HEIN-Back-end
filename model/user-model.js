const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    phone: String,
    email: {
        type: String,
        unique: true,
        required: true,
        match:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    addresses: [{
        title: String,
        country: String,
        city: String,
        street: String,
        building: String,
        floor: String,
        apartment: String,
        isDefault: Boolean
    }],
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: String,
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        productPrice: Number,
        productMainPic: String
    }]
}, {
    timestamps: true
})

userSchema.pre('save', async function() {
    if(this.isModified('passwordHash')) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
})

userSchema.methods.isCorrectPassword = async function(inputPassword) {
    return await bcrypt.compare(inputPassword, this.passwordHash);
}

module.exports = mongoose.model('User', userSchema);