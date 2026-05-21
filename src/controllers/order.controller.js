const orderService = require('../services/order.service')

const createOrder = async (req, res) => {
    try {
        const body = req.body
        if (!body) return res.status(400).json({
            err: 1,
            mess: 'Dữ liệu đơn hàng không được để trống'
        })

        const response = await orderService.createOrderService(body)
        return res.status(200).json(response)
    } catch (error) {
        console.error('createOrder error:', error)
        return res.status(500).json({
            err: 1,
            mess: 'Có lỗi khi tạo đơn hàng'
        })
    }
}

const getOrdersByUser = async (req, res) => {
    try {
        const userId = req.params.userId
        if (!userId) return res.status(400).json({
            err: 1,
            mess: 'Cần truyền userId'
        })

        const response = await orderService.getOrdersByUserService(userId)
        return res.status(200).json(response)
    } catch (error) {
        console.error('getOrdersByUser error:', error)
        return res.status(500).json({
            err: 1,
            mess: 'Có lỗi khi lấy đơn hàng'
        })
    }
}

const getOrderDetail = async (req, res) => {
    try {
        const orderId = req.params.id
        if (!orderId) return res.status(400).json({
            err: 1,
            mess: 'Cần truyền id đơn hàng'
        })

        const response = await orderService.getOrderDetailService(orderId)
        return res.status(200).json(response)
    } catch (error) {
        console.error('getOrderDetail error:', error)
        return res.status(500).json({
            err: 1,
            mess: 'Có lỗi khi lấy chi tiết đơn hàng'
        })
    }
}

const getAllOrders = async (req, res) => {
    try {
        const { limit, page } = req.query
        const response = await orderService.getAllOrdersService(
            Number(limit) || 20,
            Number(page) || 1
        )
        return res.status(200).json(response)
    } catch (error) {
        console.error('getAllOrders error:', error)
        return res.status(500).json({
            err: 1,
            mess: 'Có lỗi khi lấy tất cả đơn hàng'
        })
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id
        const { status } = req.body
        if (!orderId || !status) return res.status(400).json({
            err: 1,
            mess: 'Cần truyền id và status'
        })

        const response = await orderService.updateOrderStatusService(orderId, status)
        return res.status(200).json(response)
    } catch (error) {
        console.error('updateOrderStatus error:', error)
        return res.status(500).json({
            err: 1,
            mess: 'Có lỗi khi cập nhật trạng thái đơn hàng'
        })
    }
}

module.exports = {
    createOrder,
    getOrdersByUser,
    getOrderDetail,
    getAllOrders,
    updateOrderStatus,
}
