import shopService from "../../services/shop.service";
import { successResponse, errorResponse } from "../../utils/response.util";

const toShopPayload = (body) => {
  const {
    owner_id,
    slug,
    status,
    geohash,
    location,
    block_reason,
    blocked_at,
    blocked_by,
    ...payload
  } = body;

  if (payload.latitude !== undefined) payload.latitude = Number(payload.latitude);
  if (payload.longitude !== undefined) payload.longitude = Number(payload.longitude);
  if (payload.province_id !== undefined) {
    payload.province_id = payload.province_id ? Number(payload.province_id) : null;
  }
  if (payload.district_id !== undefined) {
    payload.district_id = payload.district_id ? Number(payload.district_id) : null;
  }

  return payload;
};

const handleShopError = (res, error) => {
  if (error.message === "SHOP_NOT_FOUND") {
    return errorResponse(res, "Vendor chua co shop", 404, "SHOP_NOT_FOUND");
  }

  if (error.code === 11000) {
    return errorResponse(res, "Vendor da co shop", 400, "SHOP_ALREADY_EXISTS");
  }

  return errorResponse(res, error.message || "Co loi o server");
};

export const createShop = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;
    if (!name || latitude === undefined || longitude === undefined) {
      return errorResponse(res, "name, latitude, longitude la bat buoc", 400, "BAD_REQUEST");
    }

    const payload = toShopPayload(req.body);
    if (Number.isNaN(payload.latitude) || Number.isNaN(payload.longitude)) {
      return errorResponse(res, "latitude, longitude khong hop le", 400, "BAD_REQUEST");
    }

    const shop = await shopService.createShop({
      ...payload,
      owner_id: req.user.id,
      status: "active",
    });

    return successResponse(res, shop, "Tao shop thanh cong", 201);
  } catch (error) {
    return handleShopError(res, error);
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await shopService.getShopByOwnerId(req.user.id);
    if (!shop) {
      return errorResponse(res, "Vendor chua co shop", 404, "SHOP_NOT_FOUND");
    }

    return successResponse(res, shop, "Lay shop cua vendor thanh cong");
  } catch (error) {
    return handleShopError(res, error);
  }
};

export const updateMyShop = async (req, res) => {
  try {
    const payload = toShopPayload(req.body);

    if (payload.latitude !== undefined && Number.isNaN(payload.latitude)) {
      return errorResponse(res, "latitude khong hop le", 400, "BAD_REQUEST");
    }

    if (payload.longitude !== undefined && Number.isNaN(payload.longitude)) {
      return errorResponse(res, "longitude khong hop le", 400, "BAD_REQUEST");
    }

    const shop = await shopService.updateVendorShop(req.user.id, payload);
    return successResponse(res, shop, "Cap nhat shop thanh cong");
  } catch (error) {
    return handleShopError(res, error);
  }
};

export const deleteMyShop = async (req, res) => {
  try {
    await shopService.deleteVendorShop(req.user.id);
    return successResponse(res, null, "Xoa shop thanh cong");
  } catch (error) {
    return handleShopError(res, error);
  }
};
