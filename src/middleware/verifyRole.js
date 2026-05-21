import jwt from "jsonwebtoken";
import User from "../models/UserModel";

const JWT_SECRET = "abcdefgh";

const getTokenFromRequest = (req) => {
  const authorization = req.headers.authorization;
  const tokenHeader = req.headers.token;
  const rawToken = authorization || tokenHeader;

  if (!rawToken) return null;

  const [scheme, token] = rawToken.split(" ");
  if (scheme?.toLowerCase() === "bearer" && token) return token;

  return rawToken;
};

export const verifyUser = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      err: 1,
      mess: "Yêu cầu đăng nhập",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).json({
        err: 1,
        mess: "Access token không hợp lệ hoặc hết hạn",
      });
    }

    req.user = decode;
    return next();
  });
};

export const verifyRoleAdmin = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      err: 1,
      mess: "Yêu cầu quyền admin",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).json({
        err: 1,
        mess: "Access token không hợp lệ hoặc hết hạn",
      });
    }

    if (!decode?.isAdmin) {
      return res.status(403).json({
        err: 1,
        mess: "required role admin",
      });
    }

    req.user = decode;
    return next();
  });
};

export const verifyRoleVendor = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      err: 1,
      mess: "Yeu cau quyen vendor",
    });
  }

  jwt.verify(token, JWT_SECRET, async (err, decode) => {
    if (err) {
      return res.status(401).json({
        err: 1,
        mess: "Access token khong hop le hoac het han",
      });
    }

    if (decode?.role !== "vendor") {
      return res.status(403).json({
        err: 1,
        mess: "required role vendor",
      });
    }

    try {
      const vendor = await User.findById(decode.id);
      if (
        !vendor ||
        vendor.role !== "vendor" ||
        vendor.vendor_status !== "approved" ||
        vendor.status === "blocked"
      ) {
        return res.status(403).json({
          err: 1,
          mess:
            vendor?.status === "blocked"
              ? "vendor account is blocked"
              : "vendor account is not approved",
        });
      }
    } catch (error) {
      return res.status(500).json({
        err: 1,
        mess: "Server error",
      });
    }

    req.user = decode;
    return next();
  });
};
