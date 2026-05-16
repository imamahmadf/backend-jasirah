"use strict";

const currentDate = new Date();
const programs = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    kode: "1.02.01",
    nama: "Program Pemenuhan Upaya Kesehatan Perorangan Dan Upaya Kesehatan Masyarakat",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    kode: "1.02.01",
    nama: "Program Peningkatan Kapasitas Sumber Daya Manusia Kesehatan",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    kode: "1.02.01",
    nama: "Program Sediaan Farmasi, Alat Kesehatan Dan Makanan Minuman",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
    kode: "1.02.01",
    nama: "Program Pemberdayaan Masyarakat Bidang Kesehatan",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 5,
    kode: "1.02.01",
    nama: "Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("programs", programs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("programs", null, {});
  },
};
