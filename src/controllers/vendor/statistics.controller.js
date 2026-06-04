import statisticsService from "../../services/statistics.service";

const handleStatisticsError = (res, error) => {
  if (error.message === "SHOP_NOT_FOUND") {
    return res.status(404).json({
      err: 1,
      mess: "Vendor chua co shop",
    });
  }

  if (error.message === "INVALID_DATE_RANGE") {
    return res.status(400).json({
      err: 1,
      mess: "Khoang thoi gian khong hop le",
    });
  }

  return res.status(500).json({
    err: 1,
    mess: error.message || "Server error",
  });
};

export const getDashboardStats = async (req, res) => {
  try {
    const response = await statisticsService.getVendorDashboardStatsService(
      req.user.id,
      req.query
    );

    return res.status(200).json(response);
  } catch (error) {
    return handleStatisticsError(res, error);
  }
};

export const getOverviewStats = async (req, res) => {
  try {
    const response = await statisticsService.getVendorOverviewStatsService(
      req.user.id,
      req.query
    );

    return res.status(200).json(response);
  } catch (error) {
    return handleStatisticsError(res, error);
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const response = await statisticsService.getVendorRevenueStatsService(
      req.user.id,
      req.query
    );

    return res.status(200).json(response);
  } catch (error) {
    return handleStatisticsError(res, error);
  }
};

export const getTopProductsStats = async (req, res) => {
  try {
    const response = await statisticsService.getVendorTopProductsStatsService(
      req.user.id,
      req.query
    );

    return res.status(200).json(response);
  } catch (error) {
    return handleStatisticsError(res, error);
  }
};

export const getRecentOrdersStats = async (req, res) => {
  try {
    const response = await statisticsService.getVendorRecentOrdersStatsService(
      req.user.id,
      req.query
    );

    return res.status(200).json(response);
  } catch (error) {
    return handleStatisticsError(res, error);
  }
};
