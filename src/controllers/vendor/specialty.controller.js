import joi from "joi";
import specialtyService from "../../services/specialty.service";

const handleSpecialtyError = (res, error) => {
  if (error.message === "SHOP_NOT_FOUND") {
    return res.status(404).json({
      err: 1,
      mess: "Vendor chua co shop",
    });
  }

  if (error.message === "NAME_REQUIRED") {
    return res.status(400).json({
      err: 1,
      mess: "Ten dac san la bat buoc",
    });
  }

  if (error.message === "INVALID_ID") {
    return res.status(400).json({
      err: 1,
      mess: "ID dac san khong hop le",
    });
  }

  if (error.message === "SPECIALTY_NOT_FOUND" || error.message === "SPECIALTY_NOT_OWNED") {
    return res.status(404).json({
      err: 1,
      mess: "Khong tim thay dac san cua vendor",
    });
  }

  if (error.message === "SPECIALTY_ALREADY_REVIEWED") {
    return res.status(400).json({
      err: 1,
      mess: "Chi co the sua hoac xoa dac san dang cho duyet",
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      err: 1,
      mess: "Ten hoac slug dac san da ton tai",
    });
  }

  return res.status(500).json({
    err: 1,
    mess: error.message || "Server error",
  });
};

export const createSpecialty = async (req, res) => {
  try {
    const schema = joi.object({
      name: joi.string().trim().min(2).max(150).required(),
      slug: joi.string().trim().allow("", null),
      description: joi.string().trim().allow("", null),
      image_url: joi.string().trim().allow("", null),
    });

    const { error } = schema.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.details[0].message,
      });
    }

    const specialty = await specialtyService.createVendorSpecialty(req.user.id, req.body);
    return res.status(201).json({
      err: 0,
      mess: "Tao dac san thanh cong, dang cho admin duyet",
      data: specialty,
    });
  } catch (error) {
    return handleSpecialtyError(res, error);
  }
};

export const getAvailableSpecialties = async (req, res) => {
  try {
    const specialties = await specialtyService.getPublicSpecialties();
    return res.status(200).json({
      err: 0,
      mess: "Lay danh sach dac san da duyet thanh cong",
      data: specialties,
    });
  } catch (error) {
    return handleSpecialtyError(res, error);
  }
};

export const getMySpecialties = async (req, res) => {
  try {
    const { approval_status, status } = req.query;
    if (!specialtyService.validateApprovalStatus(approval_status)) {
      return res.status(400).json({
        err: 1,
        mess: "Trang thai duyet dac san khong hop le",
      });
    }

    const filter = {};
    if (approval_status) filter.approval_status = approval_status;
    if (status) filter.status = status;

    const specialties = await specialtyService.getVendorSpecialties(req.user.id, filter);
    return res.status(200).json({
      err: 0,
      mess: "Lay danh sach dac san cua vendor thanh cong",
      data: specialties,
    });
  } catch (error) {
    return handleSpecialtyError(res, error);
  }
};

export const getPendingSpecialties = async (req, res) => {
  try {
    const specialties = await specialtyService.getVendorSpecialties(req.user.id, {
      approval_status: "pending",
    });

    return res.status(200).json({
      err: 0,
      mess: "Lay danh sach dac san dang cho duyet thanh cong",
      data: specialties,
    });
  } catch (error) {
    return handleSpecialtyError(res, error);
  }
};

export const updateSpecialty = async (req, res) => {
  try {
    const schema = joi.object({
      name: joi.string().trim().min(2).max(150),
      slug: joi.string().trim().allow("", null),
      description: joi.string().trim().allow("", null),
      image_url: joi.string().trim().allow("", null),
    }).min(1);

    const { error } = schema.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.details[0].message,
      });
    }

    const specialty = await specialtyService.updateVendorSpecialty(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      err: 0,
      mess: "Cap nhat dac san thanh cong, dang cho admin duyet",
      data: specialty,
    });
  } catch (error) {
    return handleSpecialtyError(res, error);
  }
};

export const deleteSpecialty = async (req, res) => {
  try {
    await specialtyService.deleteVendorSpecialty(req.user.id, req.params.id);
    return res.status(200).json({
      err: 0,
      mess: "Xoa dac san thanh cong",
      data: null,
    });
  } catch (error) {
    return handleSpecialtyError(res, error);
  }
};
