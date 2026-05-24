import * as zaloPayService from "../services/zalopay.service";

export const createPayment = async (req, res) => {
  try {
    const { orderId, bankCode, callbackUrl, redirectUrl } = req.body;

    if (!orderId) {
      return res.status(400).json({
        err: 1,
        mess: "orderId is required",
      });
    }

    const response = await zaloPayService.createZaloPayPaymentService(
      req.user.id,
      orderId,
      { bankCode, callbackUrl, redirectUrl }
    );

    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    const isMissingConfig = error.message === "ZALOPAY_CONFIG_MISSING";
    return res.status(isMissingConfig ? 500 : 500).json({
      err: 1,
      mess: isMissingConfig
        ? "Thieu cau hinh ZaloPay trong .env"
        : error.message || "Server error",
    });
  }
};

export const continuePayment = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.body.orderId;
    const { bankCode, callbackUrl, redirectUrl } = req.body || {};

    if (!orderId) {
      return res.status(400).json({
        err: 1,
        mess: "orderId is required",
      });
    }

    const response = await zaloPayService.createZaloPayPaymentService(
      req.user.id,
      orderId,
      { bankCode, callbackUrl, redirectUrl }
    );

    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    const isMissingConfig = error.message === "ZALOPAY_CONFIG_MISSING";
    return res.status(500).json({
      err: 1,
      mess: isMissingConfig
        ? "Thieu cau hinh ZaloPay trong .env"
        : error.message || "Server error",
    });
  }
};

export const callback = async (req, res) => {
  try {
    const response = await zaloPayService.handleZaloPayCallbackService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json({
      return_code: 0,
      return_message: error.message || "callback error",
    });
  }
};

export const queryPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        err: 1,
        mess: "orderId is required",
      });
    }

    const response = await zaloPayService.queryZaloPayPaymentService(
      req.user.id,
      orderId
    );

    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    const isMissingConfig = error.message === "ZALOPAY_CONFIG_MISSING";
    return res.status(500).json({
      err: 1,
      mess: isMissingConfig
        ? "Thieu cau hinh ZaloPay trong .env"
        : error.message || "Server error",
    });
  }
};
