import db from "../models";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "./jwt";

const hashPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(8));

export const registerService = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      const { full_name, email, phone, password, confirmPassword } = body;
      const normalizedEmail = email?.trim()?.toLowerCase();
      const normalizedPhone = phone?.trim?.();

      const checkEmailExist = await db.User.findOne({ email: normalizedEmail });
      if (checkEmailExist) {
        return resolve({
          err: 1,
          mess: "Email đã tồn tại, vui lòng chọn email khác",
        });
      }

      if (normalizedPhone) {
        const checkPhoneExist = await db.User.findOne({ phone: normalizedPhone });
        if (checkPhoneExist) {
          return resolve({
            err: 1,
            mess: "Số điện thoại đã tồn tại, vui lòng dùng số khác",
          });
        }
      }

      if (password !== confirmPassword) {
        return resolve({
          err: 1,
          mess: "Password và confirm password không khớp",
        });
      }

      const response = await db.User.create({
        full_name,
        email: normalizedEmail,
        phone: normalizedPhone || null,
        password_hash: hashPassword(password),
        role: "user",
      });

      return resolve({
        err: response ? 0 : 1,
        mess: response ? "Đăng ký thành công" : "Đăng ký thất bại",
        data: response
          ? {
              id: response.id,
              full_name: response.full_name,
              email: response.email,
              phone: response.phone,
              role: response.role,
              created_at: response.created_at,
              updated_at: response.updated_at,
            }
          : null,
      });
    } catch (error) {
      if (error?.code === 11000) {
        const duplicateField = Object.keys(error?.keyPattern || {})[0];
        return resolve({
          err: 1,
          mess:
            duplicateField === "phone"
              ? "Số điện thoại đã tồn tại, vui lòng dùng số khác"
              : "Email đã tồn tại, vui lòng chọn email khác",
        });
      }
      reject(error);
    }
  });

export const loginService = async (body) => {
  const { email, password } = body;
  const normalizedEmail = email?.trim()?.toLowerCase();

  const user = await db.User.findOne({ email: normalizedEmail });

  if (!user) {
    return {
      err: 1,
      mess: "Email hoặc mật khẩu không đúng",
      accessToken: null,
      refreshToken: null,
    };
  }

  const isChecked = bcrypt.compareSync(password, user.password_hash);

  if (!isChecked) {
    return {
      err: 1,
      mess: "Email hoặc mật khẩu không đúng",
      accessToken: null,
      refreshToken: null,
    };
  }

  const isAdmin = user.role === "admin";

  const accessToken = await generateAccessToken({
    id: user.id,
    role: user.role,
    isAdmin,
  });

  const refreshToken = await generateRefreshToken({
    id: user.id,
    role: user.role,
    isAdmin,
  });

  return {
    err: 0,
    mess: "Đăng nhập thành công",
    accessToken,
    refreshToken,
  };
};
