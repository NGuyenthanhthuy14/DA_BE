import OrderProduct from "../models/OrderProduct";
import Shop from "../models/shop.model";
import mongoose from "mongoose";

const ORDER_STATUSES = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

const createOrderCode = () =>
  `ORDER_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const getInitialPaymentData = (paymentMethod = "cod") => {
  if (paymentMethod === "cod") {
    return {
      paymentMethod,
      paymentProvider: "cod",
      paymentStatus: "unpaid",
    };
  }

  return {
    paymentMethod,
    paymentProvider: paymentMethod === "zalopay" ? "zalopay" : null,
    paymentStatus: "pending",
  };
};

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

const getOrderLookup = (orderId, extraFilter = {}) => {
  const lookup = { ...extraFilter };

  if (mongoose.Types.ObjectId.isValid(orderId)) {
    lookup._id = orderId;
  } else {
    lookup.orderCode = String(orderId);
  }

  return lookup;
};

const getExpiredPendingFilter = (extraFilter = {}) => ({
  ...extraFilter,
  isPaid: false,
  paymentStatus: "pending",
  paymentExpiresAt: { $lte: new Date() },
  status: { $ne: "cancelled" },
});

const expiredCancelData = () => ({
  status: "cancelled",
  paymentStatus: "failed",
  cancelledAt: new Date(),
  cancellationReason: "ZaloPay payment expired",
});

const cancelExpiredPendingPayments = (extraFilter = {}) =>
  OrderProduct.updateMany(getExpiredPendingFilter(extraFilter), {
    $set: expiredCancelData(),
  });

const cancelOrderIfPaymentExpired = async (order) => {
  if (
    order &&
    !order.isPaid &&
    order.paymentStatus === "pending" &&
    order.paymentExpiresAt &&
    order.paymentExpiresAt.getTime() <= Date.now() &&
    order.status !== "cancelled"
  ) {
    order.set(expiredCancelData());
    await order.save();
  }

  return order;
};

const normalizePagination = (limit = 20, page = 1) => {
  const normalizedLimit = Math.max(Number(limit) || 20, 1);
  const normalizedPage = Math.max(Number(page) || 1, 1);

  return {
    limit: normalizedLimit,
    page: normalizedPage,
  };
};

const keepVendorShopOrderOnly = (order, shopId) => {
  const orderObject =
    typeof order.toObject === "function" ? order.toObject() : order;
  const normalizedShopId = String(shopId);

  return {
    ...orderObject,
    shopOrders: (orderObject.shopOrders || []).filter(
      (shopOrder) =>
        String(shopOrder.shop?._id || shopOrder.shop) === normalizedShopId
    ),
  };
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
        orderCode,
        orderId,
      } = body;

      if (!userId || !shippingAddress || !shopOrders || shopOrders.length === 0) {
        resolve({
          err: 1,
          mess: "Du lieu don hang khong day du",
        });
        return;
      }

      const initialPaymentData = getInitialPaymentData(paymentMethod || "cod");

      const order = await OrderProduct.create({
        user: userId,
        shippingAddress,
        shopOrders,
        orderCode: orderCode || (!String(orderId || "").startsWith("ORDER_") ? "" : orderId) || createOrderCode(),
        ...initialPaymentData,
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
      await cancelExpiredPendingPayments({ user: userId });

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

export const getOrderDetailService = (orderId, userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const order = await OrderProduct.findOne(
        getOrderLookup(orderId, userId ? { user: userId } : {})
      )
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

      await cancelOrderIfPaymentExpired(order);

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

export const getVendorOrdersService = (ownerId, limit = 20, page = 1) =>
  new Promise(async (resolve, reject) => {
    try {
      const shop = await getVendorShopOrThrow(ownerId);
      const pagination = normalizePagination(limit, page);
      const filter = { "shopOrders.shop": shop._id };

      await cancelExpiredPendingPayments(filter);

      const totalOrders = await OrderProduct.countDocuments(filter);
      const orders = await OrderProduct.find(filter)
        .sort({ createdAt: -1 })
        .limit(pagination.limit)
        .skip(pagination.limit * (pagination.page - 1))
        .populate("user", "full_name email phone")
        .populate("shopOrders.items.product", "name image_url price");

      resolve({
        err: 0,
        mess: "Lay danh sach don hang cua shop thanh cong",
        data: orders.map((order) => keepVendorShopOrderOnly(order, shop._id)),
        totalOrders,
        currentPage: pagination.page,
        totalPage: Math.ceil(totalOrders / pagination.limit),
      });
    } catch (error) {
      reject(error);
    }
  });

export const getVendorOrderDetailService = (ownerId, orderId) =>
  new Promise(async (resolve, reject) => {
    try {
      const shop = await getVendorShopOrThrow(ownerId);
      const order = await OrderProduct.findOne(
        getOrderLookup(orderId, { "shopOrders.shop": shop._id })
      )
        .populate("user", "full_name email phone")
        .populate("shopOrders.shop", "name slug address cover_image")
        .populate("shopOrders.items.product", "name image_url price");

      if (!order) {
        resolve({
          err: 1,
          mess: "Khong tim thay don hang hoac don hang khong thuoc shop cua ban",
        });
        return;
      }

      await cancelOrderIfPaymentExpired(order);

      resolve({
        err: 0,
        mess: "Lay chi tiet don hang cua shop thanh cong",
        data: keepVendorShopOrderOnly(order, shop._id),
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

export const cancelExpiredPendingPaymentsService = async () => {
  return cancelExpiredPendingPayments();
};

export default {
  createOrderService,
  getOrdersByUserService,
  getOrderDetailService,
  getAllOrdersService,
  getVendorOrdersService,
  getVendorOrderDetailService,
  updateVendorOrderStatusService,
  cancelExpiredPendingPaymentsService,
};
