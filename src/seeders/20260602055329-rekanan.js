"use strict";

const currentDate = new Date();
const rekanans = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    nama: "Toko Madura",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    nama: "Gudang Jasirah",
  },

  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    nama: "CV DZAKIYA/HJ SAIPUDIN",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
    nama: "FARAS JAYA (RUDI ASMORO)",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 5,
    nama: "King Jaya",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 6,
    nama: "Naraya Water",
  },

  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 7,
    nama: "TB KARSONO (BURHAN)",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 8,
    nama: "EDHIE GYPSUM",
  },

  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 9,
    nama: "TB ABUN JAYA",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 10,
    nama: "DUNIA TEKNIK",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("rekanans", rekanans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("rekanans", null, {});
  },
};
