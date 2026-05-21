import shopService from "../services/shop.service";
import { successResponse, errorResponse } from "../utils/response.util";

export const getAllShops = async (req, res) => {
  try {
    const { owner_id } = req.query;
    const filter = {};
    if (owner_id) filter.owner_id = owner_id;

    const shops = await shopService.getAllShops(filter);
    return successResponse(res, shops, "Get shops successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Server error");
  }
};

export const getShopBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = await shopService.getShopBySlug(slug);

    if (!shop) {
      return errorResponse(res, "Shop not found", 404, "NOT_FOUND");
    }

    return successResponse(res, shop, "Get shop detail successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Server error");
  }
};

export const getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, maxDistance } = req.query;

    if (!lat || !lng) {
      return errorResponse(res, "lat and lng are required", 400, "BAD_REQUEST");
    }

    const shops = await shopService.getNearbyShops({
      lat: Number(lat),
      lng: Number(lng),
      maxDistance: Number(maxDistance) || 2000,
    });

    return successResponse(res, shops, "Get nearby shops successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Server error");
  }
};

export const getShopsWithSpecialties = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const shops = await shopService.getShopsWithSpecialties({
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
    });

    return successResponse(res, shops, "Get shops with specialties successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Server error");
  }
};

export const getShopProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await shopService.getShopProduct(id);
    return successResponse(res, products, "Get shop products successfully");
  } catch (error) {
    if (error.message === "SHOP_NOT_FOUND") {
      return errorResponse(res, "Shop not found", 404, "NOT_FOUND");
    }

    return errorResponse(res, error.message || "Server error");
  }
};
