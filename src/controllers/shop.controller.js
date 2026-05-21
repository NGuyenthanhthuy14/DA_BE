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
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

const getAllShops = async (req, res) => {
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

const getShopsWithSpecialties = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const shops = await shopService.getShopsWithSpecialties({
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
    });

    return successResponse(
      res,
      shops,
      "Lấy danh sách quán kèm specialties thành công"
    );
  } catch (error) {
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

const getShopProduct = async (req, res) => {
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
const deleteShop = async (req, res) => {
  try {
    const { id } = req.params;
    await shopService.deleteShop(id);
    return successResponse(res, null, "Xoá shop thành công");
  } catch (error) {
    if (error.message === "SHOP_NOT_FOUND") {
      return errorResponse(res, "Không tìm thấy shop", 404, "NOT_FOUND");
    }
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopBySlug,
  updateShop,
  deleteShop,
  getNearbyShops,
  getShopsWithSpecialties,
  getShopProduct
};