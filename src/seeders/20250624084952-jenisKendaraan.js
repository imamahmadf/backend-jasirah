"use strict";

const currentDate = new Date();
const jenisKendaraans = [
  { id: 1, jenis: "Roda Dua", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 2,
    jenis: "Mobil Penumpang",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  { id: 3, jenis: "keuangan", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 4,
    jenis: "Mobil Barang",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    jenis: "Ambulance",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    jenis: "Roda Empat",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisKendaraans", jenisKendaraans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisKendaraans", null, {});
  },
};
