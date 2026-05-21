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
      mess: "Có lỗi khi lấy tất cả đơn hàng",
    });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "Cần truyền id đơn hàng",
      });
    }

    const response = await orderService.getOrderDetailService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Có lỗi khi lấy chi tiết đơn hàng",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !status) {
      return res.status(400).json({
        err: 1,
        mess: "Cần truyền id và status",
      });
    }

    const response = await orderService.updateOrderStatusService(id, status);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Có lỗi khi cập nhật trạng thái đơn hàng",
    });
  }
};
