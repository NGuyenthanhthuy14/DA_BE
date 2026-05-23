import * as shippingService from "../services/shipping.service";

const handleGhnError = (res, error, fallbackMessage) => {
  const isMissingConfig = error.message === "GHN_CONFIG_MISSING";
  return res.status(500).json({
    err: 1,
    mess: isMissingConfig
      ? "Thieu cau hinh GHN trong .env"
      : error.message || fallbackMessage,
    data: null,
  });
};

export const calculateShippingFee = async (req, res) => {
  try {
    const response = await shippingService.calculateShippingFeeService(req.body || {});
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return handleGhnError(res, error, "Server error when calculating shipping fee");
  }
};

export const getGhnProvinces = async (req, res) => {
  try {
    const response = await shippingService.getProvincesService();
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return handleGhnError(res, error, "Server error when getting GHN provinces");
  }
};

export const getGhnDistricts = async (req, res) => {
  try {
    const response = await shippingService.getDistrictsService(req.query || {});
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return handleGhnError(res, error, "Server error when getting GHN districts");
  }
};

export const getGhnWards = async (req, res) => {
  try {
    const response = await shippingService.getWardsService(req.query || {});
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return handleGhnError(res, error, "Server error when getting GHN wards");
  }
};
