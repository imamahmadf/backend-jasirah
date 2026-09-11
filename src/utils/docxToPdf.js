const fs = require("fs/promises");
const fsSync = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

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

  return candidates.filter(Boolean).find((candidate) => fsSync.existsSync(candidate)) || null;
}

async function convertWithLibreOffice(docxBuffer, soffice) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "surat-jalan-pdf-"));
  const docxPath = path.join(tempDir, "surat-jalan.docx");
  const pdfPath = path.join(tempDir, "surat-jalan.pdf");

  try {
    await fs.writeFile(docxPath, docxBuffer);
    await execFileAsync(
      soffice,
      ["--headless", "--norestore", "--convert-to", "pdf", "--outdir", tempDir, docxPath],
      { timeout: 60000, windowsHide: true },
    );
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
