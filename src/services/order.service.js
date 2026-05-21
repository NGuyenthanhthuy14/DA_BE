import OrderProduct from "../models/OrderProduct";
import Shop from "../models/shop.model";

const ORDER_STATUSES = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

const getVendorShopOrThrow = async (ownerId) => {
  const shop = await Shop.findOne({ owner_id: String(ownerId) });
  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  return shop;
};

const getOrderStatusUpdateData = (status) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error("INVALID_ORDER_STATUS");
  }

  const updateData = { status };

  if (status === "delivered") {
    updateData.isDelivered = true;
    updateData.deliveredAt = new Date();
  }

  return updateData;
};

export const createOrderService = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      const {
        userId,
        shippingAddress,
        shopOrders,
        paymentMethod,
        subtotal,
        shippingTotal,
        totalPrice,
      } = body;

      if (!userId || !shippingAddress || !shopOrders || shopOrders.length === 0) {
        resolve({
          err: 1,
          mess: "Du lieu don hang khong day du",
        });
        return;
      }

      const order = await OrderProduct.create({
        user: userId,
        shippingAddress,
        shopOrders,
        paymentMethod: paymentMethod || "cod",
        subtotal,
        shippingTotal,
        totalPrice,
      });

      resolve({
        err: order ? 0 : 1,
        mess: order ? "Tao don hang thanh cong" : "Tao don hang that bai",
        data: order,
      });
    } catch (error) {
      reject(error);
    }
  });

export const getOrdersByUserService = (userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const orders = await OrderProduct.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.items.product", "name image_url price");

      resolve({
        err: 0,
        mess: "Lay danh sach don hang thanh cong",
        data: orders,
        total: orders.length,
      });
    } catch (error) {
      reject(error);
    }
  });

export const getOrderDetailService = (orderId) =>
  new Promise(async (resolve, reject) => {
    try {
      const order = await OrderProduct.findById(orderId)
        .populate("user", "full_name email phone")
        .populate("shopOrders.shop", "name slug address cover_image")
        .populate("shopOrders.items.product", "name image_url price");

      if (!order) {
        resolve({
          err: 1,
          mess: "Khong tim thay don hang",
        });
        return;
      }

      resolve({
        err: 0,
        mess: "Lay chi tiet don hang thanh cong",
        data: order,
      });
    } catch (error) {
      reject(error);
    }
  });

export const getAllOrdersService = (limit = 20, page = 1) =>
  new Promise(async (resolve, reject) => {
    try {
      const totalOrders = await OrderProduct.countDocuments();
      const orders = await OrderProduct.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * (page - 1))
        .populate("user", "full_name email phone");

      resolve({
        err: 0,
        mess: "Lay tat ca don hang thanh cong",
        data: orders,
        totalOrders,
        currentPage: page,
        totalPage: Math.ceil(totalOrders / limit),
      });
    } catch (error) {
      reject(error);
    }
  });

export const updateVendorOrderStatusService = (ownerId, orderId, status) =>
  new Promise(async (resolve, reject) => {
    try {
      const shop = await getVendorShopOrThrow(ownerId);
      const updateData = getOrderStatusUpdateData(status);

      const order = await OrderProduct.findOneAndUpdate(
        {
          _id: orderId,
          "shopOrders.shop": shop._id,
        },
        updateData,
        { new: true, runValidators: true }
      );

      if (!order) {
        resolve({
          err: 1,
          mess: "Khong tim thay don hang hoac don hang khong thuoc shop cua ban",
        });
        return;
      }

      resolve({
        err: 0,
        mess: "Cap nhat trang thai don hang thanh cong",
        data: order,
      });
    } catch (error) {
      reject(error);
    }
  });

export default {
  createOrderService,
  getOrdersByUserService,
  getOrderDetailService,
  getAllOrdersService,
  updateVendorOrderStatusService,
};
