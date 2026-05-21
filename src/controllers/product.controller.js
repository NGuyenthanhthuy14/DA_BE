import * as productService from "../services/product.service";

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
      mess: "Server error",
    });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;
    const response = await productService.getAllProductService(
      Number(limit) || 11,
      Number(page) || 1,
      sort,
      filter
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};

export const getAllType = async (req, res) => {
  try {
    const response = await productService.getAllTypeService();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};

export const getNearbyProducts = async (req, res) => {
  try {
    const { lat, lng, maxKm, limit } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({
        err: 1,
        mess: "lat and lng are required",
      });
    }

    const response = await productService.getNearbyProductsService(
      Number(lat),
      Number(lng),
      Number(maxKm) || 20,
      Number(limit) || 20
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};
