"use strict";

const currentDate = new Date();
const jenisBarjas = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    jenis: "Belanja Pegawai",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    jenis: "Kendaraan",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    jenis: "Mebel",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
    jenis: "Kendaraan",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 5,
    jenis: "ALat Kesehatan",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 6,
    jenis: "Makanan dan Minuman",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisBarjas", jenisBarjas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisBarjas", null, {});
  },
};
