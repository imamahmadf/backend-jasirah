const fs = require("fs");
const path = require("path");
const { templateKPBPN } = require("../models");

const PUBLIC_ROOT = path.resolve(__dirname, "../public");

function resolvePublicFilePath(relativePath) {
  if (!relativePath) return null;
  const normalized = String(relativePath).replace(/^[/\\]+/, "");
  const fullPath = path.resolve(PUBLIC_ROOT, normalized);
  const relative = path.relative(PUBLIC_ROOT, fullPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return fullPath;
}

async function getActiveTemplateFilePath(jenisDokumen) {
  const record = await templateKPBPN.findOne({
    where: { jenisDokumen, status: "aktif" },
    order: [
      ["updatedAt", "DESC"],
      ["id", "DESC"],
    ],
  });

  const fullPath = resolvePublicFilePath(record?.template);
  if (!fullPath || !fs.existsSync(fullPath)) return null;
  return fullPath;
}

module.exports = {
  PUBLIC_ROOT,
  resolvePublicFilePath,
  getActiveTemplateFilePath,
};
