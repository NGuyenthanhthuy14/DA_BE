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
