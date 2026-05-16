const QRCode = require("qrcode");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

/**
 * Generate QR DataURL with a centered logo overlay.
 * - qrText: string to encode in QR
 * - options: { sizePx?: number, logoPath?: string, logoScale?: number, logoPaddingScale?: number, cornerRadius?: number, knockout?: boolean }
 *   sizePx: final QR size in pixels (default 500)
 *   logoPath: absolute path to logo image (PNG recommended, with transparency)
 *   logoScale: logo width relative to QR width (0-1), default 0.22
 *   logoPaddingScale: white padding around logo relative to QR width, default 0.04
 *   cornerRadius: rounded corner factor (0-0.5) for white box, default 0.12
 *   knockout: draw white box under logo to clear QR modules, default true
 * Returns: data:image/png;base64,...
 */
async function generateQrWithLogo(qrText, options = {}) {
  const {
    sizePx = 500,
    logoPath,
    logoScale = 0.22,
    logoPaddingScale = 0.04,
    cornerRadius = 0,
    knockout = true,
  } = options;

  const qrPng = await QRCode.toBuffer(qrText, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 1,
    width: sizePx,
    color: {
      dark: "#000000",
      light: "#FFFFFFFF",
    },
  });

  if (!logoPath) {
    // no logo, return QR as data url
    const base64 = qrPng.toString("base64");
    return `data:image/png;base64,${base64}`;
  }

  const resolvedLogoPath = path.isAbsolute(logoPath)
    ? logoPath
    : path.join(process.cwd(), logoPath);

  if (!fs.existsSync(resolvedLogoPath)) {
    const base64 = qrPng.toString("base64");
    return `data:image/png;base64,${base64}`;
  }

  const logoBuf = await sharp(resolvedLogoPath)
    .resize(Math.round(sizePx * logoScale), Math.round(sizePx * logoScale), {
      fit: "contain",
    })
    .png()
    .toBuffer();

  const composites = [];

  if (knockout) {
    // Draw white box under the logo (with padding and rounded corners)
    const logoW = Math.round(sizePx * logoScale);
    const padding = Math.round(sizePx * logoPaddingScale);
    const boxSize = logoW + padding * 2;
    const rx = Math.max(
      0,
      Math.min(Math.round(boxSize * cornerRadius), Math.floor(boxSize / 2))
    );
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${boxSize}" height="${boxSize}"><rect x="0" y="0" width="${boxSize}" height="${boxSize}" rx="${rx}" ry="${rx}" fill="#FFFFFF"/></svg>`;
    composites.push({ input: Buffer.from(svg), gravity: "center" });
  }

  // Then overlay the logo
  composites.push({ input: logoBuf, gravity: "center" });

  const composed = await sharp(qrPng).composite(composites).png().toBuffer();

  const base64 = composed.toString("base64");
  return `data:image/png;base64,${base64}`;
}

module.exports = { generateQrWithLogo };
