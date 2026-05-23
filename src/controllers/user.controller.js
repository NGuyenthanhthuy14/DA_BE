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
