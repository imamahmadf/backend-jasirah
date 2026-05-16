"use strict";

const currentDate = new Date();
const suratPesanans = [
  {
    id: 1,
    nomor: "800.1.2/NOMOR/BULAN/TAHUN",
    indukUnitKerjaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("suratPesanans", suratPesanans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("suratPesanans", null, {});
  },
};
