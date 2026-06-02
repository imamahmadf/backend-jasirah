"use strict";

const currentDate = new Date();
const jenisPengeluarans = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    nama: "pembelian",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    nama: "gaji",
  },

  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    nama: "entertain",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisPengeluarans", jenisPengeluarans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisPengeluarans", null, {});
  },
};
