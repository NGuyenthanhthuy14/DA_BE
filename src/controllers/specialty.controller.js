import specialtyService from "../services/specialty.service";
import specialtyStoryService from "../services/specialtyStory.service";
import { successResponse, errorResponse } from "../utils/response.util";

export const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await specialtyService.getPublicSpecialties();
    return successResponse(res, specialties, "Get specialties successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Server error");
  }
};

export const getNearbySpecialties = async (req, res) => {
  try {
    const { lat, lng, maxKm, limit } = req.query;
    if (lat === undefined || lng === undefined) {
      return errorResponse(res, "lat and lng are required", 400, "BAD_REQUEST");
    }

    const specialties = await specialtyService.getNearbySpecialties(
      lat,
      lng,
      maxKm || 20,
      limit || 20
    );

    return successResponse(res, {
      specialties,
      total: specialties.length,
      radiusKm: Number(maxKm) || 20,
    }, "Get nearby specialties successfully");
  } catch (error) {
    if (error.message === "INVALID_COORDINATES") {
      return errorResponse(res, "latitude, longitude khong hop le", 400, "BAD_REQUEST");
    }

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

export const getSpecialtyStoryBySlug = async (req, res) => {
  try {
    const story = await specialtyStoryService.getPublishedStoryBySpecialtySlug(req.params.slug);

    if (!story) {
      return errorResponse(res, "Specialty story not found", 404, "NOT_FOUND");
    }

    return successResponse(res, story, "Get specialty story successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Server error");
  }
};
