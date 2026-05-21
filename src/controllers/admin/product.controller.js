import joi from "joi";
import {
  name,
  image_url,
  category_id,
  specialty_id,
  price,
  countInStock,
  rating,
  description,
  shop_id,
} from "../../helpers/joi_validate";
import * as productService from "../../services/product.service";

export const createProduct = async (req, res) => {
  try {
    const schema = joi.object({
      name,
      image_url,
      category_id,
      specialty_id,
      price,
      countInStock,
      rating,
      description,
      shop_id,
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.message || "Dữ liệu sản phẩm không hợp lệ",
      });
    }

    const response = await productService.createProductService(req.body);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Có lỗi ở server",
    });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;
    const response = await productService.getAllProductService(
      Number(limit) || 20,
      Number(page) || 1,
      sort,
      filter
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Có lỗi ở server",
    });
  }
};

export const getDetailProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "required id",
      });
    }

    const response = await productService.getDetailProductService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Có lỗi ở server",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "required id",
      });
    }

    const response = await productService.updateProductService(id, req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Có lỗi ở server",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "required id",
      });
    }

    const response = await productService.deleteProductService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Có lỗi ở server",
    });
  }
};

export const deleteProductAll = async (req, res) => {
  try {
    const ids = req.body;
    if (!ids) {
      return res.status(400).json({
        err: 1,
        mess: "required ids",
      });
    }

    const response = await productService.deleteProductAllService(ids);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Có lỗi ở server",
    });
  }
};
