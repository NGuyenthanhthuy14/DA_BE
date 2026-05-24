import orderService from "../services/order.service";

export const createOrder = async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({
        err: 1,
        mess: "Order data is required",
      });
    }

    const response = await orderService.createOrderService(body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error when creating order",
    });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        err: 1,
        mess: "userId is required",
      });
    }

    const response = await orderService.getOrdersByUserService(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error when getting user orders",
    });
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

    const response = await orderService.getOrderDetailService(id, req.user.id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error when getting order detail",
    });
  }
};
