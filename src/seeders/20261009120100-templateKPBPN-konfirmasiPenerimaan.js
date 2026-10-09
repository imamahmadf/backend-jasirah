"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM templateKPBPNs WHERE id = 4 LIMIT 1",
    );

    if (existing.length) return;

    const now = new Date();
    await queryInterface.bulkInsert("templateKPBPNs", [
      {
        id: 4,
        nama: "konfirmasi penerimaan",
        jenisDokumen: "konfirmasiPenerimaan",
        template: "/konfirmasi-penerimaan/konfirmasi-penerimaan.docx",
        status: "aktif",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("templateKPBPNs", { id: 4 });
  },
};
