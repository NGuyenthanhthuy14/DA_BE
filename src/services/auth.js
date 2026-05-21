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

      const checkEmailExist = await db.User.findOne({ email: normalizedEmail });
      if (checkEmailExist) {
        return resolve({
          err: 1,
          mess: "Email đã tồn tại, vui lòng chọn email khác",
        });
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
        password_hash: hashPassword(password),
        role: "user",
      });

      return resolve({
        err: response ? 0 : 1,
        mess: response ? "Đăng ký thành công" : "Đăng ký thất bại",
        data: response
          ? {
              _id: response._id,
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
      user: null,
    };
  }

  const isChecked = bcrypt.compareSync(password, user.password_hash);

  if (!isChecked) {
    return {
      err: 1,
      mess: "Email hoặc mật khẩu không đúng",
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  }

  const isAdmin = user.role === "admin";

  const accessToken = await generateAccessToken({
    id: user._id,
    role: user.role,
    isAdmin,
  });

  const refreshToken = await generateRefreshToken({
    id: user._id,
    role: user.role,
    isAdmin,
  });

  return {
    err: 0,
    mess: "Đăng nhập thành công",
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};
