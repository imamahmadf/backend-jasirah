"use strict";

const currentDate = new Date();
const kondisis = [
  { id: 1, nama: "Baik", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 2,
    nama: "Rusak Ringan",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    nama: "Rusak Berat",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    nama: "Hilang",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    nama: "Dipinjamkan",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("kondisis", kondisis, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("kondisis", null, {});
  },
};
