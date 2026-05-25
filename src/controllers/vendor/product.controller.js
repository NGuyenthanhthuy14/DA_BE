import joi from "joi";
import {
    name,
    image_url,
    specialty_id,
    price,
    countInStock,
    rating,
    description,
} from "../../helpers/joi_validate";
import * as productService from "../../services/product.service";

const handleProductError = (res, error) => {
    if (error.message === "SHOP_NOT_FOUND") {
        return res.status(404).json({
            err: 1,
            mess: "Vendor chua co shop",
        });
    }

    return res.status(500).json({
        err: 1,
        mess: error.message || "Server error",
    });
};

export const createProduct = async (req, res) => {
    try {
        const schema = joi.object({
            name,
            image_url,
            specialty_id,
            price,
            countInStock,
            rating,
            description,
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                err: 1,
                mess: error.message || "Du lieu san pham khong hop le",
            });
        }

        const response = await productService.createVendorProductService(req.user.id, req.body);
        return res.status(201).json(response);
    } catch (error) {
        return handleProductError(res, error);
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const { limit, page, sort, filter } = req.query;
        const response = await productService.getVendorProductsService(
            req.user.id,
            Number(limit) || 20,
            Number(page) || 1,
            sort,
            filter,
        );

        return res.status(200).json(response);
    } catch (error) {
        return handleProductError(res, error);
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

        const response = await productService.getVendorDetailProductService(req.user.id, id);
        return res.status(200).json(response);
    } catch (error) {
        return handleProductError(res, error);
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

        const response = await productService.updateVendorProductService(req.user.id, id, req.body);
        return res.status(200).json(response);
    } catch (error) {
        return handleProductError(res, error);
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

        const response = await productService.deleteVendorProductService(req.user.id, id);
        return res.status(200).json(response);
    } catch (error) {
        return handleProductError(res, error);
    }
};

export const deleteProductAll = async (req, res) => {
    try {
        const ids = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                err: 1,
                mess: "required ids",
            });
        }

        const response = await productService.deleteVendorProductAllService(req.user.id, ids);
        return res.status(200).json(response);
    } catch (error) {
        return handleProductError(res, error);
    }
};
