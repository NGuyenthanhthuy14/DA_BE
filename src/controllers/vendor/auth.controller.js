import joi from "joi";
import * as authService from "../../services/auth.service";

const isProduction = process.env.NODE_ENV === "production";
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const register = async (req, res) => {
  try {
    const schema = joi.object({
      full_name: joi.string().trim().min(2).max(150).required(),
      email: joi.string().trim().email().max(150).required(),
      phone: joi.string().trim().max(20).allow("", null),
      password: joi.string().min(6).required(),
      confirmPassword: joi.string().valid(joi.ref("password")).required(),
    });

    const { error } = schema.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.details[0].message,
      });
    }

    const response = await authService.registerService({
      ...req.body,
      role: "vendor",
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
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
    if (response.err || response.user?.role !== "vendor") {
      return res.status(403).json({
        err: 1,
        mess: response.mess || "Tai khoan khong co quyen vendor",
      });
    }

    const { refreshToken, ...data } = response;
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
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
      mess: error.message || "Server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(200).json({
      err: 0,
      mess: "Dang xuat vendor thanh cong",
    });
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};
