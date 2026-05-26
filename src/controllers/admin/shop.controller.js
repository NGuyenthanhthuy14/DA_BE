import shopService from "../../services/shop.service";
import { successResponse, errorResponse } from "../../utils/response.util";

export const getAllShops = async (req, res) => {
  try {
    const { owner_id, status } = req.query;
    const filter = {};
    if (owner_id) filter.owner_id = owner_id;
    if (status) filter.status = status;

    const shops = await shopService.getAllShops(filter);
    return successResponse(res, shops, "Lay danh sach shop thanh cong");
  } catch (error) {
    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const getShopBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = await shopService.getShopBySlug(slug);
    if (!shop) {
      return errorResponse(res, "Khong tim thay shop", 404, "NOT_FOUND");
    }

    return successResponse(res, shop, "Lay chi tiet shop thanh cong");
  } catch (error) {
    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const getShopProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await shopService.getShopProduct(id);
    return successResponse(res, products, "Lay san pham cua shop thanh cong");
  } catch (error) {
    if (error.message === "SHOP_NOT_FOUND") {
      return errorResponse(res, "Khong tim thay shop", 404, "NOT_FOUND");
    }

    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const blockShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !String(reason).trim()) {
      return errorResponse(res, "Ly do block shop la bat buoc", 400, "BAD_REQUEST");
    }

    const shop = await shopService.blockShop(id, {
      reason: String(reason).trim(),
      blocked_by: req.user?.id,
    });

    return successResponse(res, shop, "Block shop thanh cong");
  } catch (error) {
    if (error.message === "SHOP_NOT_FOUND") {
      return errorResponse(res, "Khong tim thay shop", 404, "NOT_FOUND");
    }

    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const backfillShopGeohashes = async (req, res) => {
  try {
    const result = await shopService.backfillShopGeohashes();
    return successResponse(res, result, "Backfill geohash cho shop thanh cong");
  } catch (error) {
    return errorResponse(res, error.message || "Co loi khi backfill geohash");
  }
};
