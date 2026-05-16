"use strict";

const currentDate = new Date();
const kegiatans = [
  {
    id: 1,
    programId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "02.01",
    nama: "Penyediaan Fasilitas Pelayanan Kesehatan untuk UKM dan UKP Kewenangan Daerah Kabupaten/Kota",
  },
  {
    id: 2,
    programId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "02.03",
    nama: "Penyediaan Layanan Kesehatan untuk UKM dan UKP Rujukan Tingkat Daerah Kabupaten/Kota",
  },
  {
    id: 3,
    programId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "02.04",
    nama: "Penyelenggaraan Sistem Informasi Kesehatan Secara Terintegrasi",
  },
  {
    id: 4,
    programId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "03.04",
    nama: "Penerbitan Izin Rumah Sakit Kelas C, D dan Fasilitas Pelayanan Kesehatan Tingkat Daerah Kabupaten/Kota",
  },
  {
    id: 5,
    programId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "03.01",
    nama: "Perencanaan Kebutuhan dan Pendayagunaan Sumber Daya Manusia Kesehatan untuk UKP dan UKM di Wilayah Kabupaten/Kota",
  },
  {
    id: 6,
    programId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "06.01",
    nama: "Pengembangan Mutu dan Peningkatan Kompetensi Teknis Sumber Daya Manusia Kesehatan Tingkat Daerah Kabupaten/Kota",
  },
  {
    id: 7,
    programId: 3,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "01.01",
    nama: "Pemberian Izin Apotek, Toko Obat, Toko Alat Kesehatan dan Optikal, Usaha Mikro Obat Tradisional (UMOT)",
  },
  {
    id: 8,
    programId: 4,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "01.04",
    nama: "Advokasi, Pemberdayaan, Kemitraan, Peningkatan Peran serta Masyarakat dan Lintas Sektor Tingkat Daerah Kabupaten/Kota",
  },
  {
    id: 9,
    programId: 4,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "01.06",
    nama: "Pelaksanaan Sehat dalam rangka Promotif Preventif Tingkat Daerah Kabupaten/Kota",
  },
  {
    id: 10,
    programId: 4,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "07.02",
    nama: "Pengembangan dan Pelaksanaan Upaya Kesehatan Bersumber Daya Masyarakat (UKBM) Tingkat Daerah Kabupaten/Kota",
  },
  {
    id: 11,
    programId: 5,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "09.01",
    nama: "Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah",
  },
  {
    id: 12,
    programId: 5,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "09.03",
    nama: "Administrasi Keuangan Perangkat Daerah",
  },
  {
    id: 13,
    programId: 5,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "09.04",
    nama: "Administrasi Barang Milik Daerah pada Perangkat Daerah",
  },
  {
    id: 14,
    programId: 5,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "09.08",
    nama: "Administrasi Kepegawaian Perangkat Daerah",
  },
  {
    id: 15,
    programId: 5,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "02.02",
    nama: "Administrasi Umum Perangkat Daerah",
  },
  {
    id: 16,
    programId: 5,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "02.09",
    nama: "Penyediaan Jasa Penunjang Urusan Pemerintahan Daerah",
  },
  {
    id: 17,
    programId: 5,
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "08.05",
    nama: "Pemeliharaan Barang Milik Daerah Penunjang Urusan Pemerintahan Daerah",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("kegiatans", kegiatans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("kegiatans", null, {});
  },
};
