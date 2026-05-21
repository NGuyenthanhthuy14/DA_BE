import orderService from "../../services/order.service";

export const getAllOrders = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const response = await orderService.getAllOrdersService(
      Number(limit) || 20,
      Number(page) || 1
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error when getting orders",
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

    const response = await orderService.getOrderDetailService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error when getting order detail",
    });
  }
};
