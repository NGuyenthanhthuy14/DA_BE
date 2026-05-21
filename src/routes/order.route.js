const express = require('express')
const router = express.Router()
const orderController = require('../controllers/order.controller')

// Tạo đơn hàng mới
router.post('/create', orderController.createOrder)

// Lấy đơn hàng theo userId
router.get('/user/:userId', orderController.getOrdersByUser)

// Lấy chi tiết đơn hàng
router.get('/detail/:id', orderController.getOrderDetail)

// Lấy tất cả đơn hàng (admin)
router.get('/get-all', orderController.getAllOrders)

// Cập nhật trạng thái đơn hàng
router.put('/status/:id', orderController.updateOrderStatus)

module.exports = router
