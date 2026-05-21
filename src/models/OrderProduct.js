const mongoose = require('mongoose')

// ── Chi tiết từng sản phẩm trong đơn hàng ──
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },        // giá sản phẩm
    quantity: { type: Number, required: true },
    itemTotal: { type: Number, required: true },     // price × quantity
}, { _id: false })

// ── Hoá đơn cho từng shop trong đơn hàng ──
const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    shopName: { type: String, required: true },
    items: [orderItemSchema],
    shippingMethod: { type: String, default: 'standard' },     // standard | express
    shippingLabel: { type: String, default: 'Giao hàng tiêu chuẩn' },
    shippingPrice: { type: Number, default: 0 },               // phí ship shop
    productTotal: { type: Number, required: true },             // tổng tiền sản phẩm shop
    shopTotal: { type: Number, required: true },                // productTotal + shippingPrice
    note: { type: String, default: '' },                        // ghi chú cho shop
}, { _id: true })

// ── Đơn hàng tổng ──
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, default: '' },
        district: { type: String, default: '' },
        ward: { type: String, default: '' },
        detail: { type: String, default: '' },
    },
    shopOrders: [shopOrderSchema],                              // hoá đơn từng shop
    paymentMethod: { type: String, required: true },            // cod | bank | ewallet | card
    subtotal: { type: Number, required: true },                 // tổng tiền sản phẩm tất cả shop
    shippingTotal: { type: Number, required: true },            // tổng phí ship tất cả shop
    totalPrice: { type: Number, required: true },               // subtotal + shippingTotal
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending',
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
}, {
    timestamps: true
})

const OrderProduct = mongoose.model('OrderProduct', orderSchema)
module.exports = OrderProduct