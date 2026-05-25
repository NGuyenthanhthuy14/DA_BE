import specialtyService from "../services/specialty.service";
import { successResponse, errorResponse } from "../utils/response.util";

export const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await specialtyService.getPublicSpecialties();
    return successResponse(res, specialties, "Get specialties successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Server error");
  }
};

export const getSpecialtyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const specialty = await specialtyService.getSpecialtyBySlug(slug, {
      status: "active",
      approval_status: "approved",
    });

    if (!specialty) {
      return errorResponse(res, "Specialty not found", 404, "NOT_FOUND");
    }

    return successResponse(res, specialty, "Get specialty detail successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Server error");
  }
};
