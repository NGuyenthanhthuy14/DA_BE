import * as productService from "../../services/product.service";

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
      mess: error.message || "Server error",
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
      mess: "Server error",
    });
  }
};
