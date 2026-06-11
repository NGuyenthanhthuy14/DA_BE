import specialtyStoryService from "../../services/specialtyStory.service";
import { successResponse, errorResponse } from "../../utils/response.util";

const handleStoryError = (res, error) => {
  if (error.message === "INVALID_ID") {
    return errorResponse(res, "ID cau chuyen khong hop le", 400, "BAD_REQUEST");
  }

  if (error.message === "INVALID_SPECIALTY_ID") {
    return errorResponse(res, "ID dac san khong hop le", 400, "BAD_REQUEST");
  }

  if (error.message === "SPECIALTY_NOT_FOUND") {
    return errorResponse(res, "Khong tim thay dac san", 404, "NOT_FOUND");
  }

  if (error.message === "STORY_NOT_FOUND") {
    return errorResponse(res, "Khong tim thay cau chuyen dac san", 404, "NOT_FOUND");
  }

  if (error.message === "STORY_ALREADY_EXISTS") {
    return errorResponse(res, "Dac san nay da co cau chuyen", 400, "BAD_REQUEST");
  }

  if (error.message === "TITLE_REQUIRED") {
    return errorResponse(res, "Tieu de cau chuyen la bat buoc", 400, "BAD_REQUEST");
  }

  if (error.message === "CONTENT_REQUIRED") {
    return errorResponse(res, "Noi dung cau chuyen la bat buoc", 400, "BAD_REQUEST");
  }

  if (error.message === "INVALID_STATUS") {
    return errorResponse(res, "Trang thai cau chuyen khong hop le", 400, "BAD_REQUEST");
  }

  if (error.code === 11000) {
    return errorResponse(res, "Slug hoac dac san cua cau chuyen da ton tai", 400, "BAD_REQUEST");
  }

  return errorResponse(res, error.message || "Co loi o server");
};

export const createSpecialtyStory = async (req, res) => {
  try {
    const story = await specialtyStoryService.createSpecialtyStory(req.body, req.user?.id);
    return successResponse(res, story, "Tao cau chuyen dac san thanh cong", 201);
  } catch (error) {
    return handleStoryError(res, error);
  }
};

export const getAllSpecialtyStories = async (req, res) => {
  try {
    const { status, specialty_id } = req.query;
    if (!specialtyStoryService.validateStoryStatus(status)) {
      return errorResponse(res, "Trang thai cau chuyen khong hop le", 400, "BAD_REQUEST");
    }

    const filter = {};
    if (status) filter.status = status;
    if (specialty_id) filter.specialty_id = specialty_id;

    const stories = await specialtyStoryService.getAllSpecialtyStories(filter);
    return successResponse(res, stories, "Lay danh sach cau chuyen dac san thanh cong");
  } catch (error) {
    return handleStoryError(res, error);
  }
};

export const getSpecialtyStoryById = async (req, res) => {
  try {
    const story = await specialtyStoryService.getSpecialtyStoryById(req.params.id);
    if (!story) {
      return errorResponse(res, "Khong tim thay cau chuyen dac san", 404, "NOT_FOUND");
    }

    return successResponse(res, story, "Lay chi tiet cau chuyen dac san thanh cong");
  } catch (error) {
    return handleStoryError(res, error);
  }
};

export const updateSpecialtyStory = async (req, res) => {
  try {
    const story = await specialtyStoryService.updateSpecialtyStory(req.params.id, req.body);
    return successResponse(res, story, "Cap nhat cau chuyen dac san thanh cong");
  } catch (error) {
    return handleStoryError(res, error);
  }
};

export const publishSpecialtyStory = async (req, res) => {
  try {
    const story = await specialtyStoryService.publishSpecialtyStory(req.params.id);
    return successResponse(res, story, "Xuat ban cau chuyen dac san thanh cong");
  } catch (error) {
    return handleStoryError(res, error);
  }
};

export const archiveSpecialtyStory = async (req, res) => {
  try {
    const story = await specialtyStoryService.archiveSpecialtyStory(req.params.id);
    return successResponse(res, story, "Luu tru cau chuyen dac san thanh cong");
  } catch (error) {
    return handleStoryError(res, error);
  }
};

export const deleteSpecialtyStory = async (req, res) => {
  try {
    await specialtyStoryService.deleteSpecialtyStory(req.params.id);
    return successResponse(res, null, "Xoa cau chuyen dac san thanh cong");
  } catch (error) {
    return handleStoryError(res, error);
  }
};
