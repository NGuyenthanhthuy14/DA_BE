import joi from "joi";
import * as userService from "../services/user.service";

const profileSchema = joi
  .object({
    full_name: joi.string().trim().min(2).max(150),
    email: joi.string().trim().email(),
    phone: joi.string().trim().allow(""),
    avatar_url: joi.string().trim().uri().allow(""),
    avatarUrl: joi.string().trim().uri().allow(""),
    address: joi.string().trim().max(500).allow(""),
  })
  .min(1)
  .unknown(false);

const productReviewSchema = joi
  .object({
    orderId: joi.string().required(),
    productId: joi.string().required(),
    rating: joi.number().integer().min(1).max(5).required(),
    comment: joi.string().trim().max(1000).allow("").default(""),
  })
  .unknown(false);

const addressSchema = joi
  .object({
    label: joi.string().trim().max(100).allow("").default(""),
    fullName: joi.string().trim().min(2).max(150).required(),
    phone: joi.string().trim().min(8).max(20).required(),
    address: joi.string().trim().max(500).required(),
    city: joi.string().trim().max(100).allow("").default(""),
    district: joi.string().trim().max(100).allow("").default(""),
    ward: joi.string().trim().max(100).allow("").default(""),
    detail: joi.string().trim().max(500).allow("").default(""),
    is_default: joi.boolean().default(false),
  })
  .unknown(false);

const updateAddressSchema = joi
  .object({
    label: joi.string().trim().max(100).allow(""),
    fullName: joi.string().trim().min(2).max(150),
    phone: joi.string().trim().min(8).max(20),
    address: joi.string().trim().max(500),
    city: joi.string().trim().max(100).allow(""),
    district: joi.string().trim().max(100).allow(""),
    ward: joi.string().trim().max(100).allow(""),
    detail: joi.string().trim().max(500).allow(""),
    is_default: joi.boolean(),
  })
  .min(1)
  .unknown(false);

export const getProfile = async (req, res) => {
  try {
    const response = await userService.getCurrentUserService(req.user.id);
    return res.status(response.err ? 404 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { error, value } = profileSchema.validate(req.body, {
      abortEarly: true,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.details[0].message,
      });
    }

    const response = await userService.updateCurrentUserService(req.user.id, value);
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const getAddressBook = async (req, res) => {
  try {
    const response = await userService.getAddressBookService(req.user.id);
    return res.status(response.err ? 404 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const addAddressBook = async (req, res) => {
  try {
    const { error, value } = addressSchema.validate(req.body, {
      abortEarly: true,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.details[0].message,
      });
    }

    const response = await userService.addAddressBookService(req.user.id, value);
    return res.status(response.err ? 400 : 201).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const updateAddressBook = async (req, res) => {
  try {
    const { addressId } = req.params;
    if (!addressId) {
      return res.status(400).json({
        err: 1,
        mess: "address id is required",
      });
    }

    const { error, value } = updateAddressSchema.validate(req.body, {
      abortEarly: true,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.details[0].message,
      });
    }

    const response = await userService.updateAddressBookService(
      req.user.id,
      addressId,
      value
    );
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const deleteAddressBook = async (req, res) => {
  try {
    const { addressId } = req.params;
    if (!addressId) {
      return res.status(400).json({
        err: 1,
        mess: "address id is required",
      });
    }

    const response = await userService.deleteAddressBookService(req.user.id, addressId);
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const addFavoriteShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res.status(400).json({
        err: 1,
        mess: "shop id is required",
      });
    }

    const response = await userService.addFavoriteShopService(req.user.id, shopId);
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const getFavoriteShops = async (req, res) => {
  try {
    const response = await userService.getFavoriteShopsService(req.user.id);
    return res.status(response.err ? 404 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const removeFavoriteShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res.status(400).json({
        err: 1,
        mess: "shop id is required",
      });
    }

    const response = await userService.removeFavoriteShopService(req.user.id, shopId);
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const createProductReview = async (req, res) => {
  try {
    const { error, value } = productReviewSchema.validate(req.body, {
      abortEarly: true,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.details[0].message,
      });
    }

    const response = await userService.createProductReviewService(req.user.id, value);
    return res.status(response.err ? 400 : 201).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const getMyProductReviews = async (req, res) => {
  try {
    const response = await userService.getMyProductReviewsService(req.user.id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};
