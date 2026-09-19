const jwt = require("jsonwebtoken");
const blacklistedTokens = new Set();

const ROLE_KPBPN = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  MITRA: 3,
  KEUANGAN: 4,
  PETUGAS_KEAMANAN: 5,
};

const getKpbpnRoleIds = (req) => {
  if (Array.isArray(req.user?.roleIds)) {
    return req.user.roleIds.map(Number);
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(
        authHeader.split(" ")[1],
        process.env.JWT_SECRET || "SECRET_KEY",
      );
      return (decoded.roleIds || []).map(Number);
    } catch (_) {
      return [];
    }
  }

  return [];
};

const isPetugasKeamananOnly = (req) => {
  const roleIds = getKpbpnRoleIds(req);
  return (
    roleIds.includes(ROLE_KPBPN.PETUGAS_KEAMANAN) &&
    !roleIds.includes(ROLE_KPBPN.SUPER_ADMIN) &&
    !roleIds.includes(ROLE_KPBPN.ADMIN)
  );
};

const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // Periksa apakah token di-blacklist (HANYA jika ada di blacklist)
  if (blacklistedTokens.has(token)) {
    return res
      .status(401)
      .json({ message: "Unauthorized - Token expired (logout)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    req.user = decoded; // Simpan data user di request
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

const authorizeKpbpnRoles = (roles) => {
  return (req, res, next) => {
    const userRoleIds = (req.user?.roleIds || []).map(Number);
    const hasRole = roles.some((roleId) => userRoleIds.includes(Number(roleId)));
    if (!hasRole) {
      return res.status(403).json({
        message: "Forbidden: Insufficient permissions",
        error: "Anda tidak memiliki akses",
      });
    }
    next();
  };
};

module.exports = {
  ROLE_KPBPN,
  getKpbpnRoleIds,
  isPetugasKeamananOnly,
  authenticateUser,
  authorizeRole,
  authorizeKpbpnRoles,
  isTokenBlacklisted,
  blacklistedTokens,
};
