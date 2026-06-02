const PizZip = require("pizzip");

const PAGE_BREAK_XML =
  '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

function mergeDocxBuffers(buffers) {
  if (!buffers.length) {
    throw new Error("Tidak ada dokumen untuk digabungkan");
  }

  if (buffers.length === 1) {
    return buffers[0];
  }

  const firstZip = new PizZip(buffers[0]);
  let firstXml = firstZip.file("word/document.xml").asText();

  for (let i = 1; i < buffers.length; i++) {
    const nextXml = new PizZip(buffers[i]).file("word/document.xml").asText();
    const bodyMatch = nextXml.match(/<w:body[^>]*>([\s\S]*)<\/w:body>/);

    if (!bodyMatch) {
      continue;
    }

    const bodyContent = bodyMatch[1].replace(
      /<w:sectPr[\s\S]*?<\/w:sectPr>/g,
      "",
    );

    firstXml = firstXml.replace(
      "</w:body>",
      PAGE_BREAK_XML + bodyContent + "</w:body>",
    );
  }

  firstZip.file("word/document.xml", firstXml);
  return firstZip.generate({ type: "nodebuffer" });
}

module.exports = { mergeDocxBuffers };
