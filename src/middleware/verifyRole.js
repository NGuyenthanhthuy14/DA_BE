import jwt from "jsonwebtoken";

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
