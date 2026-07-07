"use strict";

const currentDate = new Date();
const templateKPBPNs = [
  {
    id: 1,
    nama: "Template BAST",
    jenisDokumen: "BAST",
    template: "/BAST/BAST-template.docx",
    status: "aktif",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    nama: "Template BA Penerimaan",
    jenisDokumen: "BAPenerimaan",
    template: "/BAST/BAPenerimaan-template.docx",
    status: "aktif",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    nama: "Template Surat Jalan",
    jenisDokumen: "suratJalan",
    template: "/surat-jalan/surat-jalan.docx",
    status: "aktif",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("templateKPBPNs", templateKPBPNs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("templateKPBPNs", null, {});
  },
};
