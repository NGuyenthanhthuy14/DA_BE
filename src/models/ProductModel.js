const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    shop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        default: null,
    },
    name: {type:String, unique: true},
    image: {type:String},
    type: {type:String},
    price: {type:Number},
    countInStock: {type:Number},
    rating: {type:Number},
    description: {type:String},
    sold: {type: Number},
    discount: {type: Number}
},{
    timestamps: true
})

const Product = mongoose.model("Product",productSchema)
module.exports = Product