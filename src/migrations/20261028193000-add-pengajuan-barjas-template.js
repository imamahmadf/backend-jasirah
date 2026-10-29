"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE templateKPBPNs
      MODIFY jenisDokumen ENUM(
        'BAST',
        'BABongkar',
        'suratJalan',
        'konfirmasiPenerimaan',
        'pengajuanBarjas'
      ) NOT NULL
    `);

    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM templateKPBPNs WHERE jenisDokumen = 'pengajuanBarjas' LIMIT 1",
    );

    if (!existing.length) {
      const now = new Date();
      await queryInterface.bulkInsert("templateKPBPNs", [
        {
          nama: "Template Pengajuan Barang Jasa",
          jenisDokumen: "pengajuanBarjas",
          template: "/pengajuan-barjas/pengajuan-barjas.docx",
          status: "aktif",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("templateKPBPNs", {
      jenisDokumen: "pengajuanBarjas",
      template: "/pengajuan-barjas/pengajuan-barjas.docx",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE templateKPBPNs
      MODIFY jenisDokumen ENUM(
        'BAST',
        'BABongkar',
        'suratJalan',
        'konfirmasiPenerimaan'
      ) NOT NULL
    `);
  },
};
