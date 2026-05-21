import * as userService from "../../services/user.service";

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        err: 1,
        mess: "user id is required",
      });
    }

    const response = await userService.updateUserService(id, req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        err: 1,
        mess: "id is required",
      });
    }

    const response = await userService.deleteUserService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const response = await userService.getAllUserService();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const getDetailUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        err: 1,
        mess: "id is required",
      });
    }

    const response = await userService.getDetailUserService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked_reason } = req.body;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "user id is required",
      });
    }

    const response = await userService.blockUserService(id, blocked_reason);
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "user id is required",
      });
    }

    const response = await userService.unblockUserService(id);
    return res.status(response.err ? 404 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};

export const deleteUserAll = async (req, res) => {
  try {
    const ids = req.body;
    if (!ids) {
      return res.status(400).json({
        err: 1,
        mess: "required ids",
      });
    }

    const response = await userService.deleteUserAllService(ids);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error",
    });
  }
};
