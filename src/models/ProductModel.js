const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    shop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        default: null,
    },
    specialty_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialty',
        default: null,
    },
    name: { type: String, unique: true },
    slug: { type: String, unique: true, trim: true },
    image_url: { type: String, default: "" },
    price: { type: Number },
    description: { type: String },
    countInStock: { type: Number },
    rating: { type: Number },
    sold: { type: Number },
    discount: { type: Number },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
    versionKey: false,
})

const Product = mongoose.model("Product", productSchema)
module.exports = Product
