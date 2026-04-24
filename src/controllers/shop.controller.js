const shopService = require("../services/shop.service");
const { successResponse, errorResponse } = require("../utils/response.util");

const createShop = async (req, res) => {
  try {
    const {
      owner_id,
      name,
      latitude,
      longitude,
    } = req.body;

    if (!owner_id || !name || latitude === undefined || longitude === undefined) {
      return errorResponse(res, "owner_id, name, latitude, longitude là bắt buộc", 400, "BAD_REQUEST");
    }

    const shop = await shopService.createShop({
      ...req.body,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });

    return successResponse(res, shop, "Tạo shop thành công", 201);
  } catch (error) {
    if (error.message === "OWNER_ALREADY_HAS_SHOP") {
      return errorResponse(res, "Chủ shop này đã có cửa hàng", 400, "BAD_REQUEST");
    }

    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

const getAllShops = async (req, res) => {
  try {
    const shops = await shopService.getAllShops();
    return successResponse(res, shops, "Lấy danh sách shop thành công");
  } catch (error) {
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

const getShopBySlug = async (req, res) => {
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

const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.latitude !== undefined) payload.latitude = Number(payload.latitude);
    if (payload.longitude !== undefined) payload.longitude = Number(payload.longitude);

    const shop = await shopService.updateShop(id, payload);

    return successResponse(res, shop, "Cập nhật shop thành công");
  } catch (error) {
    if (error.message === "SHOP_NOT_FOUND") {
      return errorResponse(res, "Không tìm thấy shop", 404, "NOT_FOUND");
    }

    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

const getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, maxDistance } = req.query;

    if (!lat || !lng) {
      return errorResponse(res, "lat và lng là bắt buộc", 400, "BAD_REQUEST");
    }

    const shops = await shopService.getNearbyShops({
      lat: Number(lat),
      lng: Number(lng),
      maxDistance: Number(maxDistance) || 2000,
    });

    return successResponse(res, shops, "Lấy danh sách shop gần bạn thành công");
  } catch (error) {
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopBySlug,
  updateShop,
  getNearbyShops,
};