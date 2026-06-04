import mongoose from "mongoose";
import OrderProduct from "../models/OrderProduct";
import Product from "../models/ProductModel";
import Shop from "../models/shop.model";

const ORDER_STATUSES = ["pending", "confirmed", "shipping", "delivered", "cancelled"];
const DEFAULT_RECENT_ORDERS_LIMIT = 5;
const DEFAULT_TOP_PRODUCTS_LIMIT = 5;

const getVendorShopOrThrow = async (ownerId) => {
  const shop = await Shop.findOne({ owner_id: String(ownerId) });
  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  return shop;
};

const parseDate = (value, { endOfDay = false } = {}) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_DATE_RANGE");
  }

  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
};

const getDateRangeMatch = ({ startDate, endDate } = {}) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate, { endOfDay: true });

  if (start && end && start.getTime() > end.getTime()) {
    throw new Error("INVALID_DATE_RANGE");
  }

  if (!start && !end) return {};

  return {
    createdAt: {
      ...(start ? { $gte: start } : {}),
      ...(end ? { $lte: end } : {}),
    },
  };
};

const normalizeLimit = (value, fallback, max = 50) => {
  const limit = Number(value) || fallback;
  return Math.min(Math.max(limit, 1), max);
};

const getShopObjectId = (shopId) => new mongoose.Types.ObjectId(shopId);

const getOrderMatch = (shopId, query = {}) => ({
  "shopOrders.shop": getShopObjectId(shopId),
  ...getDateRangeMatch(query),
});

const getStatusTotals = (statusStats = []) => {
  const totals = ORDER_STATUSES.reduce((result, status) => {
    result[status] = 0;
    return result;
  }, {});

  statusStats.forEach((item) => {
    totals[item._id] = item.count;
  });

  return totals;
};

const getMoneyValue = (value) => Number(value || 0);

const getVendorOrderAggregationBase = (shopId, query = {}) => [
  { $match: getOrderMatch(shopId, query) },
  { $unwind: "$shopOrders" },
  {
    $match: {
      "shopOrders.shop": getShopObjectId(shopId),
    },
  },
];

const getOverviewStats = async (shopId, query) => {
  const [productCount, orderStats] = await Promise.all([
    Product.countDocuments({ shop_id: shopId }),
    OrderProduct.aggregate([
      ...getVendorOrderAggregationBase(shopId, query),
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          grossRevenue: {
            $sum: {
              $cond: [{ $ne: ["$status", "cancelled"] }, "$shopOrders.shopTotal", 0],
            },
          },
          deliveredRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, "$shopOrders.shopTotal", 0],
            },
          },
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ["$isPaid", true] }, "$shopOrders.shopTotal", 0],
            },
          },
          cancelledRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, "$shopOrders.shopTotal", 0],
            },
          },
          totalProductsSold: {
            $sum: {
              $cond: [
                { $ne: ["$status", "cancelled"] },
                {
                  $reduce: {
                    input: "$shopOrders.items",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.quantity"] },
                  },
                },
                0,
              ],
            },
          },
          nonCancelledOrders: {
            $sum: {
              $cond: [{ $ne: ["$status", "cancelled"] }, 1, 0],
            },
          },
          statusStats: { $push: "$status" },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          grossRevenue: 1,
          deliveredRevenue: 1,
          paidRevenue: 1,
          cancelledRevenue: 1,
          totalProductsSold: 1,
          averageOrderValue: {
            $cond: [
              { $gt: ["$nonCancelledOrders", 0] },
              { $divide: ["$grossRevenue", "$nonCancelledOrders"] },
              0,
            ],
          },
          statusStats: 1,
        },
      },
    ]),
  ]);

  const stats = orderStats[0] || {};
  const statusCounts = getStatusTotals(
    (stats.statusStats || []).reduce((items, status) => {
      const existing = items.find((item) => item._id === status);
      if (existing) {
        existing.count += 1;
      } else {
        items.push({ _id: status, count: 1 });
      }
      return items;
    }, [])
  );

  return {
    totalProducts: productCount,
    totalOrders: stats.totalOrders || 0,
    totalProductsSold: stats.totalProductsSold || 0,
    grossRevenue: getMoneyValue(stats.grossRevenue),
    deliveredRevenue: getMoneyValue(stats.deliveredRevenue),
    paidRevenue: getMoneyValue(stats.paidRevenue),
    cancelledRevenue: getMoneyValue(stats.cancelledRevenue),
    averageOrderValue: getMoneyValue(stats.averageOrderValue),
    ordersByStatus: statusCounts,
  };
};

const getRevenueSeries = async (shopId, query = {}) => {
  const groupBy = query.groupBy === "month" ? "month" : "day";
  const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

  return OrderProduct.aggregate([
    ...getVendorOrderAggregationBase(shopId, query),
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: "$createdAt",
            timezone: "+07:00",
          },
        },
        totalOrders: { $sum: 1 },
        grossRevenue: {
          $sum: {
            $cond: [{ $ne: ["$status", "cancelled"] }, "$shopOrders.shopTotal", 0],
          },
        },
        deliveredRevenue: {
          $sum: {
            $cond: [{ $eq: ["$status", "delivered"] }, "$shopOrders.shopTotal", 0],
          },
        },
        paidRevenue: {
          $sum: {
            $cond: [{ $eq: ["$isPaid", true] }, "$shopOrders.shopTotal", 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        period: "$_id",
        totalOrders: 1,
        grossRevenue: 1,
        deliveredRevenue: 1,
        paidRevenue: 1,
      },
    },
  ]);
};

const getTopProducts = async (shopId, query = {}) => {
  const limit = normalizeLimit(query.limit, DEFAULT_TOP_PRODUCTS_LIMIT);

  return OrderProduct.aggregate([
    ...getVendorOrderAggregationBase(shopId, query),
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$shopOrders.items" },
    {
      $group: {
        _id: "$shopOrders.items.product",
        name: { $first: "$shopOrders.items.name" },
        image: { $first: "$shopOrders.items.image" },
        quantitySold: { $sum: "$shopOrders.items.quantity" },
        revenue: { $sum: "$shopOrders.items.itemTotal" },
        orderIds: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: 1,
        image: 1,
        quantitySold: 1,
        revenue: 1,
        orderCount: { $size: "$orderIds" },
      },
    },
    { $sort: { revenue: -1, quantitySold: -1 } },
    { $limit: limit },
  ]);
};

const getRecentOrders = async (shopId, query = {}) => {
  const limit = normalizeLimit(query.limit, DEFAULT_RECENT_ORDERS_LIMIT, 20);

  const orders = await OrderProduct.find(getOrderMatch(shopId, query))
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "full_name email phone")
    .lean();

  return orders.map((order) => {
    const shopOrder = (order.shopOrders || []).find(
      (item) => String(item.shop) === String(shopId)
    );

    return {
      _id: order._id,
      orderCode: order.orderCode,
      user: order.user,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      isPaid: order.isPaid,
      shopTotal: shopOrder?.shopTotal || 0,
      productTotal: shopOrder?.productTotal || 0,
      shippingPrice: shopOrder?.shippingPrice || 0,
      itemCount: (shopOrder?.items || []).reduce(
        (total, item) => total + (item.quantity || 0),
        0
      ),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  });
};

export const getVendorDashboardStatsService = async (ownerId, query = {}) => {
  const shop = await getVendorShopOrThrow(ownerId);
  const shopId = shop._id;

  const [overview, revenueSeries, topProducts, recentOrders] = await Promise.all([
    getOverviewStats(shopId, query),
    getRevenueSeries(shopId, query),
    getTopProducts(shopId, query),
    getRecentOrders(shopId, query),
  ]);

  return {
    err: 0,
    mess: "Lay thong ke dashboard vendor thanh cong",
    data: {
      shop: {
        _id: shop._id,
        name: shop.name,
        slug: shop.slug,
      },
      filters: {
        startDate: query.startDate || null,
        endDate: query.endDate || null,
        groupBy: query.groupBy === "month" ? "month" : "day",
      },
      overview,
      revenueSeries,
      topProducts,
      recentOrders,
    },
  };
};

export const getVendorOverviewStatsService = async (ownerId, query = {}) => {
  const shop = await getVendorShopOrThrow(ownerId);
  const overview = await getOverviewStats(shop._id, query);

  return {
    err: 0,
    mess: "Lay thong ke tong quan vendor thanh cong",
    data: overview,
  };
};

export const getVendorRevenueStatsService = async (ownerId, query = {}) => {
  const shop = await getVendorShopOrThrow(ownerId);
  const revenueSeries = await getRevenueSeries(shop._id, query);

  return {
    err: 0,
    mess: "Lay thong ke doanh thu vendor thanh cong",
    data: revenueSeries,
  };
};

export const getVendorTopProductsStatsService = async (ownerId, query = {}) => {
  const shop = await getVendorShopOrThrow(ownerId);
  const topProducts = await getTopProducts(shop._id, query);

  return {
    err: 0,
    mess: "Lay thong ke san pham ban chay vendor thanh cong",
    data: topProducts,
  };
};

export const getVendorRecentOrdersStatsService = async (ownerId, query = {}) => {
  const shop = await getVendorShopOrThrow(ownerId);
  const recentOrders = await getRecentOrders(shop._id, query);

  return {
    err: 0,
    mess: "Lay don hang gan day vendor thanh cong",
    data: recentOrders,
  };
};

export default {
  getVendorDashboardStatsService,
  getVendorOverviewStatsService,
  getVendorRevenueStatsService,
  getVendorTopProductsStatsService,
  getVendorRecentOrdersStatsService,
};
