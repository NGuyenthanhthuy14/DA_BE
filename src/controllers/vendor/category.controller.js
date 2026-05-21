import joi from "joi";
import categoryService from "../../services/category.service";

const handleCategoryError = (res, error) => {
  if (error.message === "SHOP_NOT_FOUND") {
    return res.status(404).json({
      err: 1,
      mess: "Vendor chua co shop",
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      err: 1,
      mess: "Ten hoac slug danh muc da ton tai",
    });
  }

  return res.status(500).json({
    err: 1,
    mess: error.message || "Server error",
  });
};

export const createCategory = async (req, res) => {
  try {
    const schema = joi.object({
      name: joi.string().trim().min(2).max(150).required(),
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

    const category = await categoryService.createVendorCategory(req.user.id, req.body);
    return res.status(201).json({
      err: 0,
      mess: "Tao danh muc thanh cong, dang cho admin duyet",
      data: category,
    });
  } catch (error) {
    return handleCategoryError(res, error);
  }
};
