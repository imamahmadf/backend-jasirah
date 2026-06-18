"use strict";

const currentDate = new Date();
const nomorSuratKPBPNs = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    nomor: "NOMOR/KPBPN/LOG/BULAN/TAHUN",
    nomorUrut: 0,

    id: 1,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    nomor: "NOMOR/BAST/KPBPN/KODE/BULAN/TAHUN",
    nomorUrut: 0,

    id: 2,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("nomorSuratKPBPNs", nomorSuratKPBPNs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("nomorSuratKPBPNs", null, {});
  },
};
