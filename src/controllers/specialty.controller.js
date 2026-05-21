const specialtyService = require("../services/specialty.service");
const { successResponse, errorResponse } = require("../utils/response.util");

const createSpecialty = async (req, res) => {
  try {
    const specialty = await specialtyService.createSpecialty(req.body);
    return successResponse(res, specialty, "Tạo đặc sản thành công", 201);
  } catch (error) {
    if (error.message === "NAME_REQUIRED") {
      return errorResponse(res, "Tên đặc sản là bắt buộc", 400, "BAD_REQUEST");
    }

    if (error.message === "CATEGORY_REQUIRED") {
      return errorResponse(res, "category_id là bắt buộc", 400, "BAD_REQUEST");
    }

    if (error.code === 11000) {
      return errorResponse(res, "Slug đặc sản đã tồn tại", 400, "BAD_REQUEST");
    }

    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await specialtyService.getAllSpecialties();
    return successResponse(res, specialties, "Lấy danh sách đặc sản thành công");
  } catch (error) {
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

const getSpecialtyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const specialty = await specialtyService.getSpecialtyBySlug(slug);

    if (!specialty) {
      return errorResponse(res, "Không tìm thấy đặc sản", 404, "NOT_FOUND");
    }

    return successResponse(res, specialty, "Lấy chi tiết đặc sản thành công");
  } catch (error) {
    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

const updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await specialtyService.updateSpecialty(id, req.body);
    return successResponse(res, specialty, "Cập nhật đặc sản thành công");
  } catch (error) {
    if (error.message === "INVALID_ID") {
      return errorResponse(res, "ID đặc sản không hợp lệ", 400, "BAD_REQUEST");
    }

    if (error.message === "SPECIALTY_NOT_FOUND") {
      return errorResponse(res, "Không tìm thấy đặc sản", 404, "NOT_FOUND");
    }

    if (error.code === 11000) {
      return errorResponse(res, "Slug đặc sản đã tồn tại", 400, "BAD_REQUEST");
    }

    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    await specialtyService.deleteSpecialty(id);
    return successResponse(res, null, "Xóa đặc sản thành công");
  } catch (error) {
    if (error.message === "INVALID_ID") {
      return errorResponse(res, "ID đặc sản không hợp lệ", 400, "BAD_REQUEST");
    }

    if (error.message === "SPECIALTY_NOT_FOUND") {
      return errorResponse(res, "Không tìm thấy đặc sản", 404, "NOT_FOUND");
    }

    if (error.message === "SPECIALTY_HAS_PRODUCTS") {
      return errorResponse(
        res,
        "Không thể xóa đặc sản vì đang có sản phẩm liên kết",
        400,
        "BAD_REQUEST"
      );
    }

    return errorResponse(res, error.message || "Có lỗi ở server");
  }
};

module.exports = {
  createSpecialty,
  getAllSpecialties,
  getSpecialtyBySlug,
  updateSpecialty,
  deleteSpecialty,
};
