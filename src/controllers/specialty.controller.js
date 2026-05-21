const specialtyService = require("../services/specialty.service");
const { successResponse, errorResponse } = require("../utils/response.util");

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

module.exports = {
  getAllSpecialties,
  getSpecialtyBySlug,
};
