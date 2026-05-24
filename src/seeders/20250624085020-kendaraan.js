"use strict";

const currentDate = new Date();
const kendaraans = [
  {
    id: 1,
    seri: "E",
    nomor: 5004,
    createdAt: currentDate,
    updatedAt: currentDate,
    jenisKendaraanId: "1",
    noRangka: "3AY670839",
    noMesin: "3FS622612",
    unitKerjaId: 1,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("kendaraans", kendaraans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("kendaraans", null, {});
  },
};
