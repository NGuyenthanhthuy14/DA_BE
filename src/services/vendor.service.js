import db from "../models";

const VENDOR_STATUSES = ["pending", "approved", "rejected"];

export const getAllVendorsService = (status) =>
  new Promise(async (resolve, reject) => {
    try {
      const query = { role: "vendor" };
      if (status) {
        if (!VENDOR_STATUSES.includes(status)) {
          resolve({
            err: 1,
            mess: "Trang thai vendor khong hop le",
          });
          return;
        }
        query.vendor_status = status;
      }

      const vendors = await db.User.find(query)
        .select("-password_hash")
        .sort({ created_at: -1 });

      resolve({
        err: 0,
        mess: "Lay danh sach vendor thanh cong",
        data: vendors,
        total: vendors.length,
      });
    } catch (error) {
      reject(error);
    }
  });

export const getVendorDetailService = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const vendor = await db.User.findOne({ _id: id, role: "vendor" }).select(
        "-password_hash"
      );

      resolve({
        err: vendor ? 0 : 1,
        mess: vendor ? "Lay chi tiet vendor thanh cong" : "Khong tim thay vendor",
        data: vendor,
      });
    } catch (error) {
      reject(error);
    }
  });

export const updateVendorService = (id, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const updateData = { ...data };
      delete updateData.password_hash;
      delete updateData.password;
      delete updateData.role;
      delete updateData.status;
      delete updateData.blocked_reason;

      if (
        updateData.vendor_status &&
        !VENDOR_STATUSES.includes(updateData.vendor_status)
      ) {
        resolve({
          err: 1,
          mess: "Trang thai vendor khong hop le",
        });
        return;
      }

      const vendor = await db.User.findOneAndUpdate(
        { _id: id, role: "vendor" },
        updateData,
        { new: true, runValidators: true }
      ).select("-password_hash");

      resolve({
        err: vendor ? 0 : 1,
        mess: vendor ? "Cap nhat vendor thanh cong" : "Khong tim thay vendor",
        data: vendor,
      });
    } catch (error) {
      reject(error);
    }
  });

export const approveVendorService = (id) =>
  updateVendorService(id, { vendor_status: "approved" });

export const rejectVendorService = (id) =>
  updateVendorService(id, { vendor_status: "rejected" });

export default {
  getAllVendorsService,
  getVendorDetailService,
  updateVendorService,
  approveVendorService,
  rejectVendorService,
};
