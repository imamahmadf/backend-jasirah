const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { mergeDocxBuffers } = require("./mergeDocx");

function flattenSlipForDocx(prefix, slip) {
  return {
    [`${prefix}.nama`]: slip.nama,
    [`${prefix}.jabatan`]: slip.jabatan,
    [`${prefix}.total`]: slip.total,
    [`${prefix}.detail`]: slip.detail,
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

function renderSlipGajiDocx(templateContent, pages) {
  const buffers = pages.map((page) => {
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(buildDocxRenderData(page));
    return doc.getZip().generate({ type: "nodebuffer" });
  });

  return mergeDocxBuffers(buffers);
}

function renderSlipGajiFromTemplatePath(templatePath, pages) {
  const templateContent = fs.readFileSync(templatePath, "binary");
  return renderSlipGajiDocx(templateContent, pages);
}

module.exports = {
  buildDocxRenderData,
  renderSlipGajiDocx,
  renderSlipGajiFromTemplatePath,
};
