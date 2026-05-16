"use strict";

const currentDate = new Date();
const jenisDokumenBarjas = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    jenis: "Berita Acara Serah Terima",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    jenis: "Berita Acara Penerimaan Barang",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    jenis: "Surat Bukti Pengeluaran Barang",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
    jenis: "Surat Bukti Barang Keluar",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 5,
    jenis: "Berita Acara Pemeriksaan Pekerjaan",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "jenisDokumenBarjas",
      jenisDokumenBarjas,
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisDokumenBarjas", null, {});
  },
};
