import orderService from "../../services/order.service";

const handleOrderError = (res, error) => {
  if (error.message === "SHOP_NOT_FOUND") {
    return res.status(404).json({
      err: 1,
      mess: "Vendor chua co shop",
    });
  }

  if (error.message === "INVALID_ORDER_STATUS") {
    return res.status(400).json({
      err: 1,
      mess: "Trang thai don hang khong hop le",
    });
  }

  return res.status(500).json({
    err: 1,
    mess: error.message || "Server error",
  });
};

export const getOrders = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const response = await orderService.getVendorOrdersService(
      req.user.id,
      Number(limit) || 20,
      Number(page) || 1
    );

    return res.status(200).json(response);
  } catch (error) {
    return handleOrderError(res, error);
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "order id is required",
      });
    }

    const response = await orderService.getVendorOrderDetailService(
      req.user.id,
      id
    );
    return res.status(200).json(response);
  } catch (error) {
    return handleOrderError(res, error);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        err: 1,
        mess: "Can truyen id va status",
      });
    }

    const response = await orderService.updateVendorOrderStatusService(
      req.user.id,
      id,
      status
    );
    return res.status(200).json(response);
  } catch (error) {
    return handleOrderError(res, error);
  }
};
