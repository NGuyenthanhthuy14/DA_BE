import db from "../models";

const publicUserSelect = "-password_hash";

export const updateUserService = (id, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const updateData = { ...data };
      delete updateData.password;
      delete updateData.password_hash;
      delete updateData.status;
      delete updateData.blocked_reason;

      const response = await db.User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Cap nhat user thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (err) {
      reject(err);
    }
  });

export const deleteUserService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findByIdAndDelete(id);
      resolve({
        err: response ? 0 : 1,
        mess: response ? "Xoa user thanh cong" : "Khong tim thay user",
      });
    } catch (err) {
      reject(err);
    }
  });

export const getAllUserService = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.find().select(publicUserSelect);
      resolve({
        err: response ? 0 : 1,
        mess: response ? "Lay tat ca user thanh cong" : "Lay tat ca user that bai",
        data: response,
      });
    } catch (err) {
      reject(err);
    }
  });

export const getDetailUserService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findById(id).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Lay chi tiet user thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (err) {
      reject(err);
    }
  });

export const blockUserService = (id, blockedReason) =>
  new Promise(async (resolve, reject) => {
    try {
      const reason = blockedReason?.trim();
      if (!reason) {
        resolve({
          err: 1,
          mess: "blocked_reason is required",
        });
        return;
      }

      const response = await db.User.findByIdAndUpdate(
        id,
        {
          status: "blocked",
          blocked_reason: reason,
        },
        { new: true, runValidators: true }
      ).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Block user thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (error) {
      reject(error);
    }
  });

export const unblockUserService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findByIdAndUpdate(
        id,
        {
          status: "active",
          blocked_reason: "",
        },
        { new: true, runValidators: true }
      ).select(publicUserSelect);

      resolve({
        err: response ? 0 : 1,
        mess: response ? "Unblock user thanh cong" : "Khong tim thay user",
        data: response,
      });
    } catch (error) {
      reject(error);
    }
  });

export const deleteUserAllService = (ids) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.deleteMany({ _id: ids });
      resolve({
        err: response ? 0 : 1,
        mess: response ? "Xoa nhieu user thanh cong" : "Xoa nhieu user that bai",
      });
    } catch (error) {
      reject(error);
    }
  });
