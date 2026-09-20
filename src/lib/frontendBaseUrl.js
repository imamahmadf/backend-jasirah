function normalizeFrontendOrigin(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  try {
    const parsed = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, "");
  } catch (_) {
    return "";
  }
}

function getFrontendBaseUrl(req) {
  const candidates = [
    req?.query?.frontendUrl,
    req?.body?.frontendUrl,
    typeof req?.get === "function" ? req.get("origin") : null,
    req?.headers?.origin,
    typeof req?.get === "function" ? req.get("referer") : null,
    req?.headers?.referer,
    process.env.APP_BASE_URL,
    process.env.NODE_ENV === "production"
      ? process.env.APP_BASE_URL_PROD
      : process.env.APP_BASE_URL_DEV,
  ];

  for (const candidate of candidates) {
    const origin = normalizeFrontendOrigin(candidate);
    if (origin) return origin;
  }

  return "";
}

function buildFrontendPathUrl(req, pathname) {
  const base = getFrontendBaseUrl(req);
  const path = `/${String(pathname || "").replace(/^\/+/, "")}`;
  return `${base}${path}`;
}

module.exports = {
  normalizeFrontendOrigin,
  getFrontendBaseUrl,
  buildFrontendPathUrl,
};
