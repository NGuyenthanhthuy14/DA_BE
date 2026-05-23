import db from "../models";
import mongoose from "mongoose";

const publicUserSelect = "-password_hash";
const favoriteShopSelect = "name slug address formatted_address cover_image phone latitude longitude status";
const reviewPopulate = [
  { path: "product", select: "name slug image_url price rating" },
  { path: "shop", select: "name slug address cover_image" },
];

const normalizeProfilePayload = (data) => {
  const updateData = { ...data };

  if (updateData.email) {
    updateData.email = updateData.email.trim().toLowerCase();
  }

  if (updateData.avatarUrl !== undefined) {
    updateData.avatar_url = updateData.avatarUrl;
    delete updateData.avatarUrl;
  }

  return updateData;
};

export const getCurrentUserService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findById(id).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Lay thong tin user thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (err) {
      reject(err);
    }
  });

export const updateCurrentUserService = (id, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findById(id);
      if (!user) {
        resolve({
          err: 1,
          mess: "Khong tim thay user",
          data: null,
        });
        return;
      }

      if (user.status === "blocked") {
        resolve({
          err: 1,
          mess: "Tai khoan da bi khoa, khong the cap nhat thong tin",
          data: null,
        });
        return;
      }

      const response = await db.User.findByIdAndUpdate(
        id,
        normalizeProfilePayload(data),
        {
          new: true,
          runValidators: true,
        }
      ).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Cap nhat thong tin ca nhan thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (err) {
      if (err?.code === 11000) {
        const duplicateField = Object.keys(err?.keyPattern || {})[0];
        resolve({
          err: 1,
          mess:
            duplicateField === "email"
              ? "Email da ton tai, vui long chon email khac"
              : "Du lieu da ton tai",
          data: null,
        });
        return;
      }

      reject(err);
    }
  });

export const addFavoriteShopService = (userId, shopId) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        resolve({
          err: 1,
          mess: "shop id khong hop le",
          data: null,
        });
        return;
      }

      const user = await db.User.findById(userId);
      if (!user) {
        resolve({
          err: 1,
          mess: "Khong tim thay user",
          data: null,
        });
        return;
      }

      if (user.status === "blocked") {
        resolve({
          err: 1,
          mess: "Tai khoan da bi khoa, khong the them shop yeu thich",
          data: null,
        });
        return;
      }

      const shop = await db.Shops.findOne({ _id: shopId, status: "active" });
      if (!shop) {
        resolve({
          err: 1,
          mess: "Khong tim thay shop",
          data: null,
        });
        return;
      }

      const response = await db.User.findByIdAndUpdate(
        userId,
        { $addToSet: { favorite_shops: shop._id } },
        { new: true, runValidators: true }
      )
        .select(publicUserSelect)
        .populate("favorite_shops", favoriteShopSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Them shop yeu thich thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (err) {
      reject(err);
    }
  });

export const getFavoriteShopsService = (userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findById(userId)
        .select("favorite_shops")
        .populate("favorite_shops", favoriteShopSelect);

      resolve({
        err: user ? 0 : 1,
        mess: user ? "Lay danh sach shop yeu thich thanh cong" : "Khong tim thay user",
        data: user ? user.favorite_shops : null,
      });
    } catch (err) {
      reject(err);
    }
  });

export const removeFavoriteShopService = (userId, shopId) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        resolve({
          err: 1,
          mess: "shop id khong hop le",
          data: null,
        });
        return;
      }

      const response = await db.User.findByIdAndUpdate(
        userId,
        { $pull: { favorite_shops: shopId } },
        { new: true, runValidators: true }
      )
        .select(publicUserSelect)
        .populate("favorite_shops", favoriteShopSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Bo shop yeu thich thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (err) {
      reject(err);
    }
  });

const recalculateProductRating = async (productId) => {
  const [ratingStats] = await db.ProductReview.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const rating = ratingStats ? Number(ratingStats.averageRating.toFixed(1)) : 0;
  await db.Product.findByIdAndUpdate(productId, { rating }, { new: true });
};

export const createProductReviewService = (userId, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const { orderId, productId, rating, comment = "" } = data;
      const invalidObjectId =
        !mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(productId);

      if (invalidObjectId) {
        resolve({
          err: 1,
          mess: "orderId hoac productId khong hop le",
          data: null,
        });
        return;
      }

      const order = await db.OrderProduct.findOne({
        _id: orderId,
        user: userId,
        $or: [{ status: "delivered" }, { isDelivered: true }],
      });

      if (!order) {
        resolve({
          err: 1,
          mess: "Chi co the danh gia san pham trong don hang da giao thanh cong",
          data: null,
        });
        return;
      }

      const productObjectId = new mongoose.Types.ObjectId(productId);
      let reviewedShopId = null;

      order.shopOrders.some((shopOrder) => {
        const hasProduct = shopOrder.items.some((item) =>
          item.product.equals(productObjectId)
        );

        if (hasProduct) {
          reviewedShopId = shopOrder.shop;
          return true;
        }

        return false;
      });

      if (!reviewedShopId) {
        resolve({
          err: 1,
          mess: "San pham khong nam trong don hang nay",
          data: null,
        });
        return;
      }

      const existingReview = await db.ProductReview.findOne({
        user: userId,
        product: productId,
        order: orderId,
      });

      if (existingReview) {
        resolve({
          err: 1,
          mess: "Ban da danh gia san pham nay trong don hang nay",
          data: null,
        });
        return;
      }

      const review = await db.ProductReview.create({
        user: userId,
        product: productId,
        order: orderId,
        shop: reviewedShopId,
        rating,
        comment,
      });

      await recalculateProductRating(productId);

      const populatedReview = await db.ProductReview.findById(review._id)
        .populate(reviewPopulate)
        .lean();

      resolve({
        err: 0,
        mess: "Danh gia san pham thanh cong",
        data: populatedReview,
      });
    } catch (err) {
      if (err?.code === 11000) {
        resolve({
          err: 1,
          mess: "Ban da danh gia san pham nay trong don hang nay",
          data: null,
        });
        return;
      }

      reject(err);
    }
  });

export const getMyProductReviewsService = (userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const reviews = await db.ProductReview.find({ user: userId })
        .sort({ created_at: -1 })
        .populate(reviewPopulate)
        .populate("order", "status isDelivered deliveredAt createdAt")
        .lean();

      resolve({
        err: 0,
        mess: "Lay danh sach danh gia cua user thanh cong",
        data: reviews,
        total: reviews.length,
      });
    } catch (err) {
      reject(err);
    }
  });

export const updateUserService = (id, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const updateData = { ...data };
      delete updateData.password;
      delete updateData.password_hash;
      delete updateData.status;
      delete updateData.blocked_reason;

      const response = await db.User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Cap nhat user thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (err) {
      reject(err);
    }
  });

export const deleteUserService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findByIdAndDelete(id);
      resolve({
        err: response ? 0 : 1,
        mess: response ? "Xoa user thanh cong" : "Khong tim thay user",
      });
    } catch (err) {
      reject(err);
    }
  });

export const getAllUserService = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.find().select(publicUserSelect);
      resolve({
        err: response ? 0 : 1,
        mess: response ? "Lay tat ca user thanh cong" : "Lay tat ca user that bai",
        data: response,
      });
    } catch (err) {
      reject(err);
    }
  });

export const getDetailUserService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findById(id).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Lay chi tiet user thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (err) {
      reject(err);
    }
  });

export const blockUserService = (id, blockedReason) =>
  new Promise(async (resolve, reject) => {
    try {
      const reason = blockedReason?.trim();
      if (!reason) {
        resolve({
          err: 1,
          mess: "blocked_reason is required",
        });
        return;
      }

      const response = await db.User.findByIdAndUpdate(
        id,
        {
          status: "blocked",
          blocked_reason: reason,
        },
        { new: true, runValidators: true }
      ).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Block user thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (error) {
      reject(error);
    }
  });

export const unblockUserService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findByIdAndUpdate(
        id,
        {
          status: "active",
          blocked_reason: "",
        },
        { new: true, runValidators: true }
      ).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Unblock user thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (error) {
      reject(error);
    }
  });

export const deleteUserAllService = (ids) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.deleteMany({ _id: ids });
      resolve({
        err: response ? 0 : 1,
        mess: response ? "Xoa nhieu user thanh cong" : "Xoa nhieu user that bai",
      });
    } catch (error) {
      reject(error);
    }
  });
