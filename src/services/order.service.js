import OrderProduct from '../models/OrderProduct'

/**
 * Tạo đơn hàng mới – lưu hoá đơn đầy đủ kể cả tổng tiền từng shop
 */
export const createOrderService = (body) => (new Promise(async (resolve, reject) => {
    try {
        const {
            userId,
            shippingAddress,
            shopOrders,       // mảng hoá đơn từng shop
            paymentMethod,
            subtotal,
            shippingTotal,
            totalPrice,
        } = body

        // Validate cơ bản
        if (!userId || !shippingAddress || !shopOrders || shopOrders.length === 0) {
            resolve({
                err: 1,
                mess: 'Dữ liệu đơn hàng không đầy đủ'
            })
            return
        }

        // Tạo order
        const order = await OrderProduct.create({
            user: userId,
            shippingAddress,
            shopOrders,
            paymentMethod: paymentMethod || 'cod',
            subtotal,
            shippingTotal,
            totalPrice,
        })

        resolve({
            err: order ? 0 : 1,
            mess: order ? 'Tạo đơn hàng thành công' : 'Tạo đơn hàng thất bại',
            data: order,
        })
    } catch (error) {
        reject(error)
    }
}))

/**
 * Lấy danh sách đơn hàng theo user
 */
export const getOrdersByUserService = (userId) => (new Promise(async (resolve, reject) => {
    try {
        const orders = await OrderProduct.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('shopOrders.items.product', 'name image_url price')

        resolve({
            err: 0,
            mess: 'Lấy danh sách đơn hàng thành công',
            data: orders,
            total: orders.length,
        })
    } catch (error) {
        reject(error)
    }
}))

/**
 * Lấy chi tiết một đơn hàng
 */
export const getOrderDetailService = (orderId) => (new Promise(async (resolve, reject) => {
    try {
        const order = await OrderProduct.findById(orderId)
            .populate('user', 'full_name email phone')
            .populate('shopOrders.shop', 'name slug address cover_image')
            .populate('shopOrders.items.product', 'name image_url price')

        if (!order) {
            resolve({
                err: 1,
                mess: 'Không tìm thấy đơn hàng'
            })
            return
        }

        resolve({
            err: 0,
            mess: 'Lấy chi tiết đơn hàng thành công',
            data: order,
        })
    } catch (error) {
        reject(error)
    }
}))

/**
 * Lấy tất cả đơn hàng (admin)
 */
export const getAllOrdersService = (limit = 20, page = 1) => (new Promise(async (resolve, reject) => {
    try {
        const totalOrders = await OrderProduct.countDocuments()
        const orders = await OrderProduct.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(limit * (page - 1))
            .populate('user', 'full_name email phone')

        resolve({
            err: 0,
            mess: 'Lấy tất cả đơn hàng thành công',
            data: orders,
            totalOrders,
            currentPage: page,
            totalPage: Math.ceil(totalOrders / limit),
        })
    } catch (error) {
        reject(error)
    }
}))

/**
 * Cập nhật trạng thái đơn hàng
 */
export const updateOrderStatusService = (orderId, status) => (new Promise(async (resolve, reject) => {
    try {
        const updateData = { status }

        // Tự động cập nhật paid/delivered khi chuyển trạng thái
        if (status === 'delivered') {
            updateData.isDelivered = true
            updateData.deliveredAt = new Date()
        }

        const order = await OrderProduct.findByIdAndUpdate(orderId, updateData, { new: true })

        if (!order) {
            resolve({
                err: 1,
                mess: 'Không tìm thấy đơn hàng'
            })
            return
        }

        resolve({
            err: 0,
            mess: 'Cập nhật trạng thái đơn hàng thành công',
            data: order,
        })
    } catch (error) {
        reject(error)
    }
}))

export default {
    createOrderService,
    getOrdersByUserService,
    getOrderDetailService,
    getAllOrdersService,
    updateOrderStatusService,
}
