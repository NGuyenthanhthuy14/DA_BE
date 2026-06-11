import specialtyStoryService from "../services/specialtyStory.service";
import { successResponse, errorResponse } from "../utils/response.util";

export const getNearbyPublishedStories = async (req, res) => {
  try {
    const { lat, lng, maxKm, limit } = req.query;
    if (lat === undefined || lng === undefined) {
      return errorResponse(res, "lat and lng are required", 400, "BAD_REQUEST");
    }

    const stories = await specialtyStoryService.getNearbyPublishedSpecialtyStories(
      lat,
      lng,
      maxKm || 20,
      limit || 20
    );

    return successResponse(res, {
      stories,
      total: stories.length,
      radiusKm: Number(maxKm) || 20,
    }, "Get nearby specialty stories successfully");
  } catch (error) {
    if (error.message === "INVALID_COORDINATES") {
      return errorResponse(res, "latitude, longitude khong hop le", 400, "BAD_REQUEST");
    }

    return errorResponse(res, error.message || "Server error");
  }
};

export const getPublishedStoryBySlug = async (req, res) => {
  try {
    const story = await specialtyStoryService.getSpecialtyStoryBySlug(req.params.slug, {
      status: "published",
    });

    if (
      !story ||
      !story.specialty_id ||
      story.specialty_id.status !== "active" ||
      story.specialty_id.approval_status !== "approved"
    ) {
      return errorResponse(res, "Specialty story not found", 404, "NOT_FOUND");
    }

    return successResponse(res, story, "Get specialty story successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Server error");
  }
};
