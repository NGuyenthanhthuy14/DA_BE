import crypto from "crypto";
import mongoose from "mongoose";
import db from "../models";

const ZALOPAY_SANDBOX_CREATE_URL = "https://sb-openapi.zalopay.vn/v2/create";
const ZALOPAY_SANDBOX_QUERY_URL = "https://sb-openapi.zalopay.vn/v2/query";
const ZALOPAY_PRODUCTION_CREATE_URL = "https://openapi.zalopay.vn/v2/create";
const ZALOPAY_PRODUCTION_QUERY_URL = "https://openapi.zalopay.vn/v2/query";
const ZALOPAY_PAYMENT_TIMEOUT_MINUTES = 20;

const getZaloPayConfig = () => {
  const appId = process.env.ZALOPAY_APP_ID;
  const key1 = process.env.ZALOPAY_KEY1;
  const key2 = process.env.ZALOPAY_KEY2;
  const isProduction = process.env.ZALOPAY_ENV === "production";

  if (!appId || !key1 || !key2) {
    throw new Error("ZALOPAY_CONFIG_MISSING");
  }

  return {
    appId,
    key1,
    key2,
    createUrl: process.env.ZALOPAY_CREATE_URL || (isProduction ? ZALOPAY_PRODUCTION_CREATE_URL : ZALOPAY_SANDBOX_CREATE_URL),
    queryUrl: process.env.ZALOPAY_QUERY_URL || (isProduction ? ZALOPAY_PRODUCTION_QUERY_URL : ZALOPAY_SANDBOX_QUERY_URL),
    callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
    redirectUrl: process.env.ZALOPAY_REDIRECT_URL,
  };
};

const hmacSha256 = (data, key) =>
  crypto.createHmac("sha256", key).update(data).digest("hex");

const getVietnamDatePrefix = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}${month}${day}`;
};

const createAppTransId = (orderId) => {
  const suffix = Date.now().toString().slice(-6);
  return `${getVietnamDatePrefix()}_${orderId}_${suffix}`;
};

const postForm = async (url, data) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data).toString(),
  });

  return response.json();
};

const buildOrderItems = (order) =>
  order.shopOrders.flatMap((shopOrder) =>
    shopOrder.items.map((item) => ({
      itemid: String(item.product),
      itemname: item.name,
      itemprice: item.price,
      itemquantity: item.quantity,
    }))
  );

const getPaymentAmount = (order, options = {}) => {
  const realAmount = Number(order.totalPrice);

  if (options.amount !== undefined && options.amount !== null) {
    return Number(options.amount);
  }

  if (process.env.ZALOPAY_TEST_AMOUNT) {
    return Number(process.env.ZALOPAY_TEST_AMOUNT);
  }

  if (process.env.ZALOPAY_ENV !== "production") {
    let testAmount = realAmount;
    while (testAmount >= 10000) {
      testAmount /= 10;
    }
    return Math.round(testAmount);
  }

  return realAmount;
};

const buildOrderLookup = (userId, orderId) => {
  const lookup = { user: userId };

  if (mongoose.Types.ObjectId.isValid(orderId)) {
    lookup._id = orderId;
  } else {
    lookup.orderCode = String(orderId);
  }

  return lookup;
};

const getZaloPayExpiresAt = () =>
  new Date(Date.now() + ZALOPAY_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

const isExpiredPendingPayment = (order) =>
  !order.isPaid &&
  order.paymentStatus === "pending" &&
  order.paymentExpiresAt &&
  order.paymentExpiresAt.getTime() <= Date.now();

const cancelExpiredPaymentOrder = async (order) => {
  order.status = "cancelled";
  order.paymentStatus = "failed";
  order.cancelledAt = order.cancelledAt || new Date();
  order.cancellationReason = "ZaloPay payment expired";
  order.paymentData = {
    ...(order.paymentData || {}),
    expiredAt: new Date(),
  };
  await order.save();
};

export const createZaloPayPaymentService = async (userId, orderId, options = {}) => {
  const config = getZaloPayConfig();
  const order = await db.OrderProduct.findOne(buildOrderLookup(userId, orderId));

  if (!order) {
    return {
      err: 1,
      mess: "Khong tim thay don hang",
      data: null,
    };
  }

  if (order.status === "cancelled") {
    return {
      err: 1,
      mess: "Don hang da bi huy",
      data: null,
    };
  }

  if (isExpiredPendingPayment(order)) {
    await cancelExpiredPaymentOrder(order);
    return {
      err: 1,
      mess: "Don hang da het han thanh toan va da bi huy",
      data: null,
    };
  }

  if (order.isPaid || order.paymentStatus === "paid") {
    return {
      err: 1,
      mess: "Don hang da duoc thanh toan",
      data: null,
    };
  }

  const appTransId = createAppTransId(order._id);
  const appTime = Date.now();
  const paymentExpiresAt = getZaloPayExpiresAt();
  const realAmount = Number(order.totalPrice);
  const amount = getPaymentAmount(order, options);
  const appUser = String(userId);
  const embedData = JSON.stringify({
    redirecturl: options.redirectUrl || config.redirectUrl || "",
    orderId: String(order._id),
  });
  const item = JSON.stringify(buildOrderItems(order));
  const description = `Thanh toan don hang #${order._id}`;
  const hmacInput = `${config.appId}|${appTransId}|${appUser}|${amount}|${appTime}|${embedData}|${item}`;

  const requestData = {
    app_id: config.appId,
    app_user: appUser,
    app_time: appTime,
    amount,
    app_trans_id: appTransId,
    embed_data: embedData,
    item,
    description,
    bank_code: options.bankCode || "",
    mac: hmacSha256(hmacInput, config.key1),
  };

  if (options.callbackUrl || config.callbackUrl) {
    requestData.callback_url = options.callbackUrl || config.callbackUrl;
  }

  const zaloPayResponse = await postForm(config.createUrl, requestData);

  await db.OrderProduct.findByIdAndUpdate(order._id, {
    paymentMethod: "ewallet",
    paymentProvider: "zalopay",
    paymentStatus: zaloPayResponse.return_code === 1 ? "pending" : "failed",
    paymentTransactionId: appTransId,
    paymentExpiresAt: zaloPayResponse.return_code === 1 ? paymentExpiresAt : undefined,
    paymentOrderUrl: zaloPayResponse.order_url || "",
    paymentOrderToken: zaloPayResponse.order_token || "",
    paymentQrCode: zaloPayResponse.qr_code || "",
    paymentData: {
      createRequest: requestData,
      createResponse: zaloPayResponse,
      realAmount,
      paymentAmount: amount,
      paymentExpiresAt,
    },
  });

  return {
    err: zaloPayResponse.return_code === 1 ? 0 : 1,
    mess:
      zaloPayResponse.return_code === 1
        ? "Tao thanh toan ZaloPay thanh cong"
        : zaloPayResponse.return_message || "Tao thanh toan ZaloPay that bai",
    data: {
      orderId: order._id,
      orderCode: order.orderCode,
      app_trans_id: appTransId,
      amount,
      realAmount,
      paymentExpiresAt,
      order_url: zaloPayResponse.order_url,
      order_token: zaloPayResponse.order_token,
      zp_trans_token: zaloPayResponse.zp_trans_token,
      qr_code: zaloPayResponse.qr_code,
      zalopay: zaloPayResponse,
    },
  };
};

export const handleZaloPayCallbackService = async ({ data, mac }) => {
  const config = getZaloPayConfig();
  const expectedMac = hmacSha256(data, config.key2);

  if (expectedMac !== mac) {
    return {
      return_code: -1,
      return_message: "mac not equal",
    };
  }

  const callbackData = JSON.parse(data);
  const order = await db.OrderProduct.findOne({
    paymentTransactionId: callbackData.app_trans_id,
  });

  if (!order) {
    return {
      return_code: 0,
      return_message: "order not found",
    };
  }

  if (order.status === "cancelled") {
    return {
      return_code: 1,
      return_message: "order cancelled",
    };
  }

  if (isExpiredPendingPayment(order)) {
    await cancelExpiredPaymentOrder(order);
    return {
      return_code: 1,
      return_message: "payment expired",
    };
  }

  if (!order.isPaid) {
    order.isPaid = true;
    order.paidAt = new Date(callbackData.server_time || Date.now());
  }

  order.paymentMethod = "ewallet";
  order.paymentProvider = "zalopay";
  order.paymentStatus = "paid";
  order.zaloPayTransId = String(callbackData.zp_trans_id || "");
  order.paymentData = {
    ...(order.paymentData || {}),
    callback: callbackData,
  };

  await order.save();

  return {
    return_code: 1,
    return_message: "success",
  };
};

export const queryZaloPayPaymentService = async (userId, orderId) => {
  const config = getZaloPayConfig();
  const order = await db.OrderProduct.findOne(buildOrderLookup(userId, orderId));

  if (!order) {
    return {
      err: 1,
      mess: "Khong tim thay don hang",
      data: null,
    };
  }

  if (!order.paymentTransactionId) {
    return {
      err: 1,
      mess: "Don hang chua co giao dich ZaloPay",
      data: null,
    };
  }

  if (order.status === "cancelled") {
    return {
      err: 1,
      mess: "Don hang da bi huy",
      data: order,
    };
  }

  if (isExpiredPendingPayment(order)) {
    await cancelExpiredPaymentOrder(order);
    return {
      err: 1,
      mess: "Don hang da het han thanh toan va da bi huy",
      data: order,
    };
  }

  const hmacInput = `${config.appId}|${order.paymentTransactionId}|${config.key1}`;
  const requestData = {
    app_id: config.appId,
    app_trans_id: order.paymentTransactionId,
    mac: hmacSha256(hmacInput, config.key1),
  };

  const zaloPayResponse = await postForm(config.queryUrl, requestData);

  if (zaloPayResponse.return_code === 1 && !order.isPaid) {
    order.isPaid = true;
    order.paidAt = new Date(zaloPayResponse.server_time || Date.now());
    order.paymentStatus = "paid";
    order.zaloPayTransId = String(zaloPayResponse.zp_trans_id || "");
  } else if (zaloPayResponse.return_code === 2) {
    order.paymentStatus = "failed";
  } else if (zaloPayResponse.return_code === 3) {
    order.paymentStatus = "pending";
  }

  order.paymentData = {
    ...(order.paymentData || {}),
    queryResponse: zaloPayResponse,
  };
  await order.save();

  return {
    err: 0,
    mess: "Truy van trang thai ZaloPay thanh cong",
    data: {
      order,
      zalopay: zaloPayResponse,
    },
  };
};
