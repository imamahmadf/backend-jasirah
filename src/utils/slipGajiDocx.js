const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { mergeDocxBuffers } = require("./mergeDocx");

const BULANAN_QUADRANTS = ["kiriAtas", "kananAtas", "kiriBawah", "kananBawah"];

function applyBulananFilledConditionals(templateContent) {
  const zip = new PizZip(templateContent);
  let xml = zip.file("word/document.xml").asText();

  if (xml.includes("{#kiriAtasFilled}")) {
    return templateContent;
  }

  let searchStart = 0;

  for (const quadrant of BULANAN_QUADRANTS) {
    const periodeNeedle = `Periode : {${quadrant}.periode}`;
    const periodeIdx = xml.indexOf(periodeNeedle, searchStart);

    if (periodeIdx < 0) {
      continue;
    }

    const beforePeriode = xml.slice(0, periodeIdx);
    const ptNeedle = "<w:t>PT JASIRAH DIZA BERJAYA</w:t>";
    const ptIdx = beforePeriode.lastIndexOf(ptNeedle);

    if (ptIdx < 0) {
      continue;
    }

    xml =
      xml.slice(0, ptIdx) +
      `<w:t>{#${quadrant}Filled}${ptNeedle.slice(5)}` +
      xml.slice(ptIdx + ptNeedle.length);

    const takeHomeNeedle = `<w:t>TAKE HOME PAY : Rp {${quadrant}.takeHomePay}</w:t>`;
    xml = xml.replace(
      takeHomeNeedle,
      `<w:t>TAKE HOME PAY : Rp {${quadrant}.takeHomePay}{/${quadrant}Filled}</w:t>`,
    );

    searchStart = periodeIdx + 1;
  }

  zip.file("word/document.xml", xml);
  return zip.generate({ type: "nodebuffer" });
}

function flattenSlipForDocx(prefix, slip) {
  return {
    [`${prefix}.nama`]: slip.nama,
    [`${prefix}.jabatan`]: slip.jabatan,
    [`${prefix}.total`]: slip.total,
    [`${prefix}.detail`]: slip.detail,
  };
}

function flattenSlipBulananForDocx(prefix, slip) {
  const isFilled = Boolean(slip?.filled);

  return {
    [`${prefix}Filled`]: isFilled,
    [`${prefix}.nama`]: isFilled ? slip.nama || "" : "",
    [`${prefix}.jabatan`]: isFilled ? slip.jabatan || "" : "",
    [`${prefix}.periode`]: isFilled ? slip.periode || "" : "",
    [`${prefix}.gajiTetap`]: isFilled && Array.isArray(slip.gajiTetap) ? slip.gajiTetap : [],
    [`${prefix}.totalGajiTetap`]: isFilled ? slip.totalGajiTetap || "0" : "",
    [`${prefix}.gajiTidakTetap`]:
      isFilled && Array.isArray(slip.gajiTidakTetap) ? slip.gajiTidakTetap : [],
    [`${prefix}.totalGajiTidakTetap`]: isFilled
      ? slip.totalGajiTidakTetap || "0"
      : "",
    [`${prefix}.potongan`]: isFilled && Array.isArray(slip.potongan) ? slip.potongan : [],
    [`${prefix}.totalPotongan`]: isFilled ? slip.totalPotongan || "0" : "",
    [`${prefix}.gajiDiterima`]: isFilled ? slip.gajiDiterima || "0" : "",
    [`${prefix}.takeHomePay`]: isFilled ? slip.takeHomePay || "0" : "",
  };
}

function buildDocxRenderData(page) {
  return {
    ...flattenSlipForDocx("kiriAtas", page.kiriAtas),
    ...flattenSlipForDocx("kananAtas", page.kananAtas),
    ...flattenSlipForDocx("kiriBawah", page.kiriBawah),
    ...flattenSlipForDocx("kananBawah", page.kananBawah),
  };
}

function buildDocxRenderDataBulanan(page) {
  return {
    ...flattenSlipBulananForDocx("kiriAtas", page.kiriAtas),
    ...flattenSlipBulananForDocx("kananAtas", page.kananAtas),
    ...flattenSlipBulananForDocx("kiriBawah", page.kiriBawah),
    ...flattenSlipBulananForDocx("kananBawah", page.kananBawah),
  };
}

function renderSlipGajiDocx(templateContent, pages, buildRenderData) {
  // Setiap entry `pages` = 1 lembar fisik berisi 4 slip.
  // Contoh: 12 pegawai -> 3 pages -> 3 lembar kertas.
  const buffers = pages.map((page) => {
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "",
    });

    doc.render(buildRenderData(page));
    return doc.getZip().generate({ type: "nodebuffer" });
  });

  return mergeDocxBuffers(buffers);
}

function renderSlipGajiFromTemplatePath(templatePath, pages) {
  const templateContent = fs.readFileSync(templatePath, "binary");
  return renderSlipGajiDocx(templateContent, pages, buildDocxRenderData);
}

function renderSlipGajiBulananFromTemplatePath(templatePath, pages) {
  const templateContent = fs.readFileSync(templatePath, "binary");
  const preparedTemplate = applyBulananFilledConditionals(templateContent);
  return renderSlipGajiDocx(preparedTemplate, pages, buildDocxRenderDataBulanan);
}

module.exports = {
  buildDocxRenderData,
  buildDocxRenderDataBulanan,
  renderSlipGajiDocx,
  renderSlipGajiFromTemplatePath,
  renderSlipGajiBulananFromTemplatePath,
};
