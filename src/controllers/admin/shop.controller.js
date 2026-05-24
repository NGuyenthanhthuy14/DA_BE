import shopService from "../../services/shop.service";
import { successResponse, errorResponse } from "../../utils/response.util";

export const createShop = async (req, res) => {
  try {
    const { owner_id, name, latitude, longitude } = req.body;
    if (!owner_id || !name || latitude === undefined || longitude === undefined) {
      return errorResponse(res, "owner_id, name, latitude, longitude là bắt buộc", 400, "BAD_REQUEST");
    }

    const shop = await shopService.createShop({
      ...req.body,
      latitude: Number(latitude),
      longitude: Number(longitude),
      province_id: req.body.province_id ? Number(req.body.province_id) : null,
      district_id: req.body.district_id ? Number(req.body.district_id) : null,
    });

    return successResponse(res, shop, "Tạo shop thành công", 201);
  } catch (error) {
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

export const getAllShops = async (req, res) => {
  try {
    const { owner_id } = req.query;
    const filter = {};
    if (owner_id) filter.owner_id = owner_id;

    const shops = await shopService.getAllShops(filter);
    return successResponse(res, shops, "Lấy danh sách shop thành công");
  } catch (error) {
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

export const getShopBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = await shopService.getShopBySlug(slug);
    if (!shop) {
      return errorResponse(res, "Không tìm thấy shop", 404, "NOT_FOUND");
    }

    return successResponse(res, shop, "Lấy chi tiết shop thành công");
  } catch (error) {
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

export const getShopProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await shopService.getShopProduct(id);
    return successResponse(res, products, "Lấy sản phẩm của shop thành công");
  } catch (error) {
    if (error.message === "SHOP_NOT_FOUND") {
      return errorResponse(res, "Không tìm thấy shop", 404, "NOT_FOUND");
    }

    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

export const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.latitude !== undefined) payload.latitude = Number(payload.latitude);
    if (payload.longitude !== undefined) payload.longitude = Number(payload.longitude);
    if (payload.province_id !== undefined) {
      payload.province_id = payload.province_id ? Number(payload.province_id) : null;
    }
    if (payload.district_id !== undefined) {
      payload.district_id = payload.district_id ? Number(payload.district_id) : null;
    }

    const shop = await shopService.updateShop(id, payload);
    return successResponse(res, shop, "Cập nhật shop thành công");
  } catch (error) {
    if (error.message === "SHOP_NOT_FOUND") {
      return errorResponse(res, "Không tìm thấy shop", 404, "NOT_FOUND");
    }

    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

export const deleteShop = async (req, res) => {
  try {
    const { id } = req.params;
    await shopService.deleteShop(id);
    return successResponse(res, null, "Xóa shop thành công");
  } catch (error) {
    if (error.message === "SHOP_NOT_FOUND") {
      return errorResponse(res, "Không tìm thấy shop", 404, "NOT_FOUND");
    }

    return errorResponse(res, error.message || "Có lỗi ở server");
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
