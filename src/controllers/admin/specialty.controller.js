import specialtyService from "../../services/specialty.service";
import { successResponse, errorResponse } from "../../utils/response.util";

export const createSpecialty = async (req, res) => {
  try {
    const specialty = await specialtyService.createSpecialty(req.body, {
      userId: req.user?.id,
      role: "admin",
    });
    return successResponse(res, specialty, "Tao dac san thanh cong", 201);
  } catch (error) {
    if (error.message === "NAME_REQUIRED") {
      return errorResponse(res, "Ten dac san la bat buoc", 400, "BAD_REQUEST");
    }

    if (error.code === 11000) {
      return errorResponse(res, "Ten hoac slug dac san da ton tai", 400, "BAD_REQUEST");
    }

    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const getAllSpecialties = async (req, res) => {
  try {
    const { approval_status, status } = req.query;
    if (!specialtyService.validateApprovalStatus(approval_status)) {
      return errorResponse(res, "Trang thai duyet dac san khong hop le", 400, "BAD_REQUEST");
    }

    const filter = {};
    if (approval_status) filter.approval_status = approval_status;
    if (status) filter.status = status;

    const specialties = await specialtyService.getAllSpecialties(filter);
    return successResponse(res, specialties, "Lay danh sach dac san thanh cong");
  } catch (error) {
    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const getSpecialtyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const specialty = await specialtyService.getSpecialtyBySlug(slug);
    if (!specialty) {
      return errorResponse(res, "Khong tim thay dac san", 404, "NOT_FOUND");
    }

    return successResponse(res, specialty, "Lay chi tiet dac san thanh cong");
  } catch (error) {
    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await specialtyService.updateSpecialty(id, req.body);
    return successResponse(res, specialty, "Cap nhat dac san thanh cong");
  } catch (error) {
    if (error.message === "INVALID_ID") {
      return errorResponse(res, "ID dac san khong hop le", 400, "BAD_REQUEST");
    }

    if (error.message === "SPECIALTY_NOT_FOUND") {
      return errorResponse(res, "Khong tim thay dac san", 404, "NOT_FOUND");
    }

    if (error.code === 11000) {
      return errorResponse(res, "Ten hoac slug dac san da ton tai", 400, "BAD_REQUEST");
    }

    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const approveSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await specialtyService.approveSpecialty(id, req.user?.id);
    return successResponse(res, specialty, "Duyet dac san thanh cong");
  } catch (error) {
    if (error.message === "INVALID_ID") {
      return errorResponse(res, "ID dac san khong hop le", 400, "BAD_REQUEST");
    }

    if (error.message === "SPECIALTY_NOT_FOUND") {
      return errorResponse(res, "Khong tim thay dac san", 404, "NOT_FOUND");
    }

    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const rejectSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejected_reason } = req.body;
    const specialty = await specialtyService.rejectSpecialty(
      id,
      rejected_reason || "",
      req.user?.id
    );
    return successResponse(res, specialty, "Tu choi dac san thanh cong");
  } catch (error) {
    if (error.message === "INVALID_ID") {
      return errorResponse(res, "ID dac san khong hop le", 400, "BAD_REQUEST");
    }

    if (error.message === "SPECIALTY_NOT_FOUND") {
      return errorResponse(res, "Khong tim thay dac san", 404, "NOT_FOUND");
    }

    return errorResponse(res, error.message || "Co loi o server");
  }
};

export const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    await specialtyService.deleteSpecialty(id);
    return successResponse(res, null, "Xoa dac san thanh cong");
  } catch (error) {
    if (error.message === "INVALID_ID") {
      return errorResponse(res, "ID dac san khong hop le", 400, "BAD_REQUEST");
    }

    if (error.message === "SPECIALTY_NOT_FOUND") {
      return errorResponse(res, "Khong tim thay dac san", 404, "NOT_FOUND");
    }

    if (error.message === "SPECIALTY_HAS_PRODUCTS") {
      return errorResponse(
        res,
        "Khong the xoa dac san vi dang co san pham lien ket",
        400,
        "BAD_REQUEST"
      );
    }

    return errorResponse(res, error.message || "Co loi o server");
  }
};
