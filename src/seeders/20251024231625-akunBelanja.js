"use strict";

const currentDate = new Date();
const akunBelanjas = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    akun: "Belanja Makanan dan Minuman ",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    akun: "Belanja Modal Alat Kedokteran Umum",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    akun: "Belanja Sewa Gedung dan Bangunan",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
    akun: "Belanja Jasa Tenaga Keamanan ",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("akunBelanjas", akunBelanjas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("akunBelanjas", null, {});
  },
};
