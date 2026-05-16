"use strict";

const currentDate = new Date();
const profesis = [
  {
    nama: "Kepala Dinas",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
  },
  {
    nama: "Dirut",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
  },
  {
    nama: "Kepala UPTD",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
  },
  {
    nama: "SEKRETARIS",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
  },
  {
    nama: "KEPALA BIDANG",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 5,
  },
  {
    nama: "KEPALA SUB BAGIAN",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 6,
  },
  {
    nama: "KEPALA TATA USAHA UPTD",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 7,
  },
  {
    nama: "KEPALA SEKSI",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 8,
  },
  {
    nama: "ADMINKES/Administrator Kesehatan",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 9,
  },
  {
    nama: "PERENCANA",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 10,
  },
  {
    nama: "PENELAAHN TEKNIS KEBIJAKAN",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 11,
  },
  {
    nama: "PENATA KELOLA OBAT DAN MAKANAN",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 12,
  },
  {
    nama: "PENATA LAYANAN OPERASIONAL",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 13,
  },
  {
    nama: "PENATA KELOLA LAYANAN KESEHATAN",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 14,
  },
  {
    nama: "PENGADMINISTRASI PERKANTORAN",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 15,
  },
  {
    nama: "PENGOLAH DATA DAN INFORMASI",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 16,
  },
  {
    nama: "PELAKSANA LAYANAN UMUM",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 17,
  },
  {
    nama: "PRANATA KOMPUTER",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 18,
  },
  {
    nama: "ANALISIS FARMASI",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 19,
  },
  {
    nama: "APOTEKER",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 20,
  },
  {
    nama: "ASISTEN APOTEKER",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 21,
  },
  {
    nama: "BIDAN",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 22,
  },
  {
    nama: "DOKTER UMUM",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 23,
  },
  {
    nama: "DOKTER SPESIALIS",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 24,
  },
  {
    nama: "DOKTER GIGI",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 25,
  },
  {
    nama: "EPIDEMIOLOG",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 26,
  },
  {
    nama: "FISIOTERAPIS",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 27,
  },
  {
    nama: "NUTRISIONIS",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 28,
  },
  {
    nama: "PERAWAT",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 29,
  },
  {
    nama: "PERAWAT GIGI",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 30,
  },
  {
    nama: "REKAM MEDIS",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 31,
  },
  {
    nama: "PRANATA LAB",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 32,
  },
  {
    nama: "LAB MIKROBIOLOGI",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 33,
  },
  {
    nama: "PROMKES",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 34,
  },
  {
    nama: "SANITARIAN",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 35,
  },
  {
    nama: "KESELAMATAN KERJA",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 36,
  },
  {
    nama: "KESEHATAN LINGKUNGAN",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 37,
  },
  {
    nama: "KESEHATAN MASYARAKAT",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 38,
  },
  {
    nama: "RADIOGRAFER",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 39,
  },
  {
    nama: "TEKNISI ELEKTROMEDIS",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 40,
  },
  {
    nama: "TENAGA ADMINSTRASI",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 41,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("profesis", profesis, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("profesis", null, {});
  },
};
