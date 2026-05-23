import * as searchService from "../services/search.service";

export const searchAll = async (req, res) => {
  try {
    const { keyword, q, shopLimit, productLimit, shopPage, productPage } = req.query;
    const response = await searchService.searchAllService({
      keyword: keyword || q,
      shopLimit,
      productLimit,
      shopPage,
      productPage,
    });

    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};

export const searchShops = async (req, res) => {
  try {
    const { keyword, q, limit, page } = req.query;
    const response = await searchService.searchShopsService({
      keyword: keyword || q,
      limit,
      page,
    });

    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};
