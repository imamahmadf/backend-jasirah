const fs = require("fs/promises");
const fsSync = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const FONTS_DIR = path.join(__dirname, "../fonts");
const LO_PROFILE_DIR = path.join(__dirname, "../.lo-profile");

let fontsReady = null;
let conversionQueue = Promise.resolve();

function convertDocxToPdf(docxBuffer) {
  const job = conversionQueue.then(() => convertInternal(docxBuffer));
  conversionQueue = job.then(
    () => undefined,
    () => undefined,
  );
  return job;
}

async function convertInternal(docxBuffer) {
  if (process.platform === "win32") {
    try {
      return await convertWithWordCom(docxBuffer);
    } catch (wordErr) {
      const soffice = findSofficeBinary();
      if (!soffice) {
        throw new Error(
          `Gagal mengonversi surat jalan ke PDF (${wordErr.message}).`,
        );
      }
      return convertWithLibreOffice(docxBuffer, soffice);
    }
  }

  const soffice = findSofficeBinary();
  if (!soffice) {
    throw new Error(
      "Gagal mengonversi surat jalan ke PDF. Pastikan LibreOffice terpasang di server.",
    );
  }

  return convertWithLibreOffice(docxBuffer, soffice);
}

function findSofficeBinary() {
  const candidates =
    process.platform === "win32"
      ? [
          process.env.LIBRE_OFFICE_EXE,
          path.join(
            process.env.PROGRAMFILES || "",
            "LibreOffice",
            "program",
            "soffice.exe",
          ),
          path.join(
            process.env["PROGRAMFILES(X86)"] || "",
            "LibreOffice",
            "program",
            "soffice.exe",
          ),
        ]
      : [
          "/usr/bin/soffice",
          "/usr/bin/libreoffice",
          "/snap/bin/libreoffice",
          "/opt/libreoffice/program/soffice",
        ];

  return (
    candidates
      .filter(Boolean)
      .find((candidate) => fsSync.existsSync(candidate)) || null
  );
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function ensureFontsProfile() {
  if (!fontsReady) fontsReady = prepareFontsProfile();
  return fontsReady;
}

async function prepareFontsProfile() {
  const userFonts = path.join(LO_PROFILE_DIR, "user", "fonts");
  const cacheDir = path.join(LO_PROFILE_DIR, "fontconfig-cache");
  await fs.mkdir(userFonts, { recursive: true });
  await fs.mkdir(cacheDir, { recursive: true });

  let fontFiles = [];
  if (fsSync.existsSync(FONTS_DIR)) {
    fontFiles = (await fs.readdir(FONTS_DIR)).filter((file) =>
      /\.(ttf|otf)$/i.test(file),
    );
  }

  await Promise.all(
    fontFiles.map(async (file) => {
      const dest = path.join(userFonts, file);
      try {
        await fs.access(dest);
      } catch {
        await fs.copyFile(path.join(FONTS_DIR, file), dest);
      }
    }),
  );

  const fontsConfPath = path.join(LO_PROFILE_DIR, "fonts.conf");
  await fs.writeFile(
    fontsConfPath,
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>${escapeXml(userFonts)}</dir>
  <dir>${escapeXml(FONTS_DIR)}</dir>
  <cachedir>${escapeXml(cacheDir)}</cachedir>
</fontconfig>
`,
    "utf8",
  );

  try {
    await execFileAsync("fc-cache", ["-f", userFonts], { timeout: 15000 });
  } catch {
    // fc-cache opsional; LibreOffice tetap membaca folder user/fonts
  }

  return { profileDir: LO_PROFILE_DIR, fontsConfPath };
}

async function convertWithLibreOffice(docxBuffer, soffice) {
  const { profileDir, fontsConfPath } = await ensureFontsProfile();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "surat-jalan-pdf-"));
  const docxPath = path.join(tempDir, "surat-jalan.docx");
  const pdfPath = path.join(tempDir, "surat-jalan.pdf");

  try {
    await fs.writeFile(docxPath, docxBuffer);

    const env = {
      ...process.env,
      FONTCONFIG_FILE: fontsConfPath,
      HOME: profileDir,
    };

    const baseArgs = [
      `-env:UserInstallation=${pathToFileURL(profileDir).href}`,
      "--headless",
      "--norestore",
      "--nolockcheck",
      "--convert-to",
    ];

    const filters = [
      'pdf:writer_pdf_Export:{"EmbedStandardFonts":{"type":"boolean","value":"true"}}',
      "pdf:writer_pdf_Export",
    ];

    let lastError;
    for (const filter of filters) {
      try {
        await execFileAsync(
          soffice,
          [...baseArgs, filter, "--outdir", tempDir, docxPath],
          { timeout: 60000, windowsHide: true, env },
        );
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError) throw lastError;

    return await fs.readFile(pdfPath);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function convertWithWordCom(docxBuffer) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "surat-jalan-pdf-"));
  const docxPath = path.join(tempDir, "surat-jalan.docx");
  const pdfPath = path.join(tempDir, "surat-jalan.pdf");

  try {
    await fs.writeFile(docxPath, docxBuffer);

    const script = `
$ErrorActionPreference = 'Stop'
$docx = ${JSON.stringify(docxPath)}
$pdf = ${JSON.stringify(pdfPath)}
$word = $null
$doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $doc = $word.Documents.Open($docx, $false, $true)
  $doc.ExportAsFixedFormat($pdf, 17)
} finally {
  if ($doc -ne $null) { $doc.Close($false) | Out-Null }
  if ($word -ne $null) { $word.Quit() | Out-Null }
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}
`;

    await execFileAsync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        script,
      ],
      { windowsHide: true, timeout: 60000 },
    );

    return await fs.readFile(pdfPath);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

module.exports = {
  convertDocxToPdf,
};
