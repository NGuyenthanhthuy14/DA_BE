import joi from "joi";
import * as authService from "../../services/auth.service";

const isProduction = process.env.NODE_ENV === "production";
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const login = async (req, res) => {
  try {
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.details[0].message,
      });
    }

    const response = await authService.loginService(req.body);
    if (response.err || response.user?.role !== "admin") {
      return res.status(403).json({
        err: 1,
        mess: "Tài khoản không có quyền admin",
      });
    }

    const { refreshToken, ...data } = response;
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Có lỗi ở server",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(404).json({
        err: 1,
        mess: "refresh token is required",
      });
    }

    const response = await authService.refreshTokenService(token);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Có lỗi ở server",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(200).json({
      err: 0,
      mess: "Đăng xuất admin thành công",
    });
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Có lỗi ở server",
    });
  }
};
